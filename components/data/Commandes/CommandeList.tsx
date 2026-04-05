'use client';
import { Database } from '@/database.types';
import { completeCommande, getCommandesWithItems } from '@/lib/data/commandes';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export type CommandeWithItems =
  Database['public']['Tables']['Commandes']['Row'] & {
    supplier: {
      id: number;
      name: string;
    };
    Commande_items: Database['public']['Tables']['Commande_items']['Row'][];
  };

const CommandeList = () => {
  const [commandes, setCommandes] = useState<CommandeWithItems[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<number, Set<number>>>({});

  const toggleItem = (commandeId: number, itemId: number) => {
    setCheckedMap((prev) => {
      const newMap = { ...prev };
      const set = new Set(newMap[commandeId] ?? []);

      if (set.has(itemId)) {
        set.delete(itemId);
      } else {
        set.add(itemId);
      }

      newMap[commandeId] = set;
      return newMap;
    });
  };

  const handleCommander = async (commandeId: number) => {
    const checkedSet = checkedMap[commandeId];

    if (!checkedSet || checkedSet.size === 0) {
      return; // rien à faire
    }

    const checkedIds = Array.from(checkedSet);

    try {
      await completeCommande(commandeId, checkedIds);

      // 🔄 refresh data
      const updated = await getCommandesWithItems();
      setCommandes(updated);

      // 🧹 reset state de CETTE commande seulement
      setCheckedMap((prev) => {
        const newMap = { ...prev };
        delete newMap[commandeId];
        return newMap;
      });
    } catch (error) {
      console.error('Erreur commande:', error);
    }
  };

  useEffect(() => {
    async function fetchCommandes() {
      const commandes = await getCommandesWithItems();
      setCommandes(commandes);
    }
    fetchCommandes();
  }, []);

  return (
    <div className="mx-auto flex flex-col gap-4 items-center justify-center w-[30vw]  ">
      {commandes.map((commande) => {
        const total = commande.Commande_items.reduce(
          (acc, item) => acc + (item.quantity ?? 0),
          0,
        );
        const hasChecked = checkedMap[commande.id]?.size > 0;

        return (
          <Card key={commande.id} className="w-full">
            <CardHeader className="py-4 relative  rounded-t-md border-b ">
              <CardTitle className="flex justify-between items-center">
                <span className="text-xl flex-1 text-center">
                  {commande.supplier?.name}
                </span>
                <span className="absolute top-5 right-2 text-sm text-muted-foreground">
                  {total} produit{total > 1 && 's'}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex mt-3 flex-col w-full gap-2">
              {/* HEADER */}
              <ul className="space-y-2">
                <li className="grid grid-cols-4 font-semibold text-sm">
                  <span>Nom</span>
                  <span className="text-center">Référence</span>
                  <span className="text-right">Quantité</span>
                  <span className="text-right">Commandé</span>
                </li>
              </ul>
              <Separator />

              {/* ITEMS */}
              {commande.Commande_items.map((item) => (
                <ul key={item.id} className="space-y-2">
                  <li className="grid grid-cols-4 text-sm items-center">
                    <span>{item.productName}</span>

                    <span className="text-center">{item.productRef}</span>

                    <span className="text-right mr-[20%] font-medium">
                      x{item.quantity ?? 0}
                    </span>
                    <span className="text-right mr-[25%]  font-medium">
                      <Checkbox
                        checked={checkedMap[commande.id]?.has(item.id) ?? false}
                        onCheckedChange={() => toggleItem(commande.id, item.id)}
                      />
                    </span>
                  </li>
                  <Separator />
                </ul>
              ))}
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                className="w-full"
                disabled={!hasChecked}
                onClick={() => handleCommander(commande.id)}
              >
                {hasChecked
                  ? 'Commander la sélection'
                  : 'Aucun produit sélectionné'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
      {commandes.length === 0 && <p>Aucune commande en cours</p>}
    </div>
  );
};

export default CommandeList;
