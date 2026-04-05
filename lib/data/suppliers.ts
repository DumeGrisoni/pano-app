'use server';

import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

import { decrypt, encrypt } from '@/lib/crypto';

type Supplier = Database['public']['Tables']['Suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['Suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['Suppliers']['Update'];

export async function getAllSuppliers(): Promise<Supplier[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Suppliers').select('*');

  if (error) throw error;

  return data ?? [];
}

export async function getSupplier(id: number): Promise<Supplier> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

export async function createSupplier(data: SupplierInsert) {
  const supabase = await createClient();

  const { error } = await supabase.from('Suppliers').insert(data);

  if (error) throw error;
}

export async function updateSupplier(id: number, data: SupplierUpdate) {
  const supabase = await createClient();

  const { error } = await supabase.from('Suppliers').update(data).eq('id', id);

  if (error) throw error;
}

export async function deleteSupplier(id: number) {
  const supabase = await createClient();

  const { error } = await supabase.from('Suppliers').delete().eq('id', id);

  if (error) throw error;
}

export async function createSupplierSecure(data: {
  name: string;
  supplierEmail: string;
  connectPassword: string;
  phone: number;
  website: string;
  connectEmail: string;
}) {
  const supabase = await createClient();

  const encryptedPassword = encrypt(data.connectPassword);

  const { error } = await supabase.from('Suppliers').insert({
    name: data.name,
    supplierEmail: data.supplierEmail,
    connectPassword: encryptedPassword,
    phone: data.phone,
    website: data.website,
    connectEmail: data.connectEmail,
  });

  if (error) throw error;
}

export async function getDecryptedPassword(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Suppliers')
    .select('connectPassword')
    .eq('id', id)
    .single();

  if (error) throw error;

  return decrypt(data.connectPassword);
}
