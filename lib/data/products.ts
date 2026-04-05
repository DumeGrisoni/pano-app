'use server';
import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Products').select();

  if (error) throw error;

  return (data as Database['public']['Tables']['Products']['Row'][]) ?? [];
}

export async function createProduct(data: {
  title: string;
  price: number;
  supplier: number;
  ref: string;
  supplierName: string;
  pricing_type: string;
  unit_multiplier: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('Products').insert(data);
  if (error) throw error;
}
