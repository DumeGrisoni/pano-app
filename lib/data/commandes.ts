'use server';

import { CommandeWithItems } from '@/components/data/Commandes/CommandeList';
import { Database } from '@/database.types';

import { CartItem } from '@/hooks/useCart';
import { createClient } from '@/lib/supabase/server';

//
// 📦 GET COMMANDES ACTIVES
//
export async function getCommandesWithItems(): Promise<CommandeWithItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Commandes')
    .select(
      `
  *,
  supplier:Suppliers (
    id,
    name
  ),
  Commande_items (*)
`,
    )
    .eq('status', 'active');

  if (error) throw error;

  return data;
}

export async function getCompletedCommandes(): Promise<CommandeWithItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Commandes')
    .select(
      `
      *,
      supplier:Suppliers (
        id,
        name
      ),
      Commande_items (*)
    `,
    )
    .eq('status', 'completed')
    .order('completed_at', { ascending: false }); // 🔥 tri du plus récent au plus ancien

  if (error) throw error;

  return data;
}

//
// 📦 GET COMMANDE + ITEMS
//
export async function getCommande(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Commandes')
    .select(`*, Commande_items (*)`)
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

//
// 🛒 VALIDATE CART → CRÉER COMMANDES PAR FOURNISSEUR
//
export async function validateCart(items: CartItem[]) {
  const supabase = await createClient();

  if (!items.length) {
    throw new Error('Le panier est vide');
  }

  const invalidItems = items.filter((item) => !item.supplier_id);

  if (invalidItems.length > 0) {
    console.error('Produits sans supplier_id:', invalidItems);
    throw new Error('Certains produits n’ont pas de fournisseur');
  }

  const grouped = items.reduce(
    (acc, item) => {
      const supplierId = Number(item.supplier_id);

      if (!Number.isFinite(supplierId)) {
        throw new Error(`supplier_id invalide pour ${item.product_name}`);
      }

      if (!acc[supplierId]) {
        acc[supplierId] = [];
      }

      acc[supplierId].push(item);
      return acc;
    },
    {} as Record<number, CartItem[]>,
  );

  for (const supplierIdStr in grouped) {
    const supplierId = Number(supplierIdStr);
    const supplierItems = grouped[supplierId];

    const { data: existing, error: existingError } = await supabase
      .from('Commandes')
      .select('*')
      .eq('supplierId', supplierId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingError) {
      console.error('Erreur recherche commande active:', existingError);
      throw new Error(existingError.message);
    }

    let commandeId = existing?.id;

    if (!commandeId) {
      const { data: newCommande, error } = await supabase
        .from('Commandes')
        .insert({
          supplierId,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur création commande:', error);
        throw new Error(error.message);
      }

      commandeId = newCommande.id;
    }

    for (const item of supplierItems) {
      const { data: existingItem, error: existingItemError } = await supabase
        .from('Commande_items')
        .select('*')
        .eq('commandeId', commandeId)
        .eq('productId', item.product_id)
        .maybeSingle();

      if (existingItemError) {
        console.error('Erreur recherche item commande:', existingItemError);
        throw new Error(existingItemError.message);
      }

      if (existingItem) {
        const { error } = await supabase
          .from('Commande_items')
          .update({
            quantity: existingItem.quantity + item.quantity,
          })
          .eq('id', existingItem.id);

        if (error) {
          console.error('Erreur update item:', error);
          throw new Error(error.message);
        }
      } else {
        const { error } = await supabase.from('Commande_items').insert({
          commandeId,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          productRef: item.product_ref,
        });

        if (error) {
          console.error('Erreur insert item:', error);
          throw new Error(error.message);
        }
      }
    }
  }
}

//
// 🔁 COMPLETER COMMANDE (SPLIT)
//
export async function completeCommande(
  commandeId: number,
  checkedItemIds: number[],
) {
  const supabase = await createClient();

  if (!checkedItemIds.length) {
    throw new Error('Aucun item sélectionné');
  }

  // 🔥 1. récupérer commande + items (1 seule requête)
  const { data: commande, error } = await supabase
    .from('Commandes')
    .select(`*, Commande_items (*)`)
    .eq('id', commandeId)
    .single();

  if (error) throw error;
  if (!commande) throw new Error('Commande introuvable');

  const items = commande.Commande_items;

  // 🔹 2. séparer les items
  const checkedItems = items.filter(
    (item: Database['public']['Tables']['Commande_items']['Row']) =>
      checkedItemIds.includes(item.id),
  );

  const uncheckedItems = items.filter(
    (item: Database['public']['Tables']['Commande_items']['Row']) =>
      !checkedItemIds.includes(item.id),
  );

  // 🔹 3. archiver la commande actuelle
  const { error: archiveError } = await supabase
    .from('Commandes')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(), // 🔥
    })
    .eq('id', commandeId);

  if (archiveError) throw archiveError;

  // 🔹 4. recréer une commande SI il reste des items
  if (uncheckedItems.length > 0) {
    const { data: newCommande, error: createError } = await supabase
      .from('Commandes')
      .insert({
        supplierId: commande.supplierId,
        status: 'active',
      })
      .select()
      .single();

    if (createError) throw createError;

    // 🔥 5. déplacer les items (PAS DE DUPLICATION)
    const uncheckedIds = uncheckedItems.map(
      (item: Database['public']['Tables']['Commande_items']['Row']) => item.id,
    );

    const { error: updateError } = await supabase
      .from('Commande_items')
      .update({ commandeId: newCommande.id })
      .in('id', uncheckedIds);

    if (updateError) throw updateError;
  }

  // 🔹 6. (optionnel) marquer les items validés
  const { error: checkedUpdateError } = await supabase
    .from('Commande_items')
    .update({ checked: true })
    .in('id', checkedItemIds);

  if (checkedUpdateError) throw checkedUpdateError;
}

//
// 🧹 DELETE ITEM
//
export async function deleteCommandeItem(itemId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('Commande_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}
