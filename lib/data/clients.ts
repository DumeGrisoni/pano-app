'use server';
import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

export async function getAllClients() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('Clients').select();

  if (error) throw error;

  return (data as Database['public']['Tables']['Clients']['Row'][]) ?? [];
}

export async function getClient(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('id', Number(id)) // ⚠️ important si id = number
    .single();

  if (error) throw error;

  return data as Database['public']['Tables']['Clients']['Row'];
}

export async function updateClient(
  id: number,
  data: Database['public']['Tables']['Clients']['Update'],
) {
  const supabase = await createClient();
  const { error } = await supabase.from('Clients').update(data).eq('id', id);
  if (error) throw error;
}

export async function createNewClient(
  data: Database['public']['Tables']['Clients']['Insert'],
) {
  const supabase = await createClient();
  const { data: newClient, error } = await supabase
    .from('Clients')
    .insert(data)
    .select()
    .single();
  if (error) throw error;

  return newClient;
}
