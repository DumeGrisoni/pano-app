import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

export async function getProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Products').select();

  if (error) throw error;

  return (data as Database['public']['Tables']['Products']['Row'][]) ?? [];
}
