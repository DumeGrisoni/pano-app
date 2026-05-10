'use server';
import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Products').select();

  if (error) throw error;

  return (data as Database['public']['Tables']['Products']['Row'][]) ?? [];
}

export async function createProduct(
  data: Database['public']['Tables']['Products']['Insert'],
) {
  const supabase = await createClient();

  const { data: newProduct, error } = await supabase
    .from('Products')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  return newProduct;
}

export async function getProduct(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateProduct(
  id: number,
  data: Database['public']['Tables']['Products']['Update'],
) {
  const supabase = await createClient();

  const { error } = await supabase.from('Products').update(data).eq('id', id);

  if (error) throw error;
}
