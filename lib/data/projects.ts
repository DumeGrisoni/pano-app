'use server';
import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export async function getAllProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Projects')
    .select()
    .neq('status', 'PAYED'); // 👈 filtre ici

  if (error) throw error;

  return (data as Database['public']['Tables']['Projects']['Row'][]) ?? [];
}

export async function getDoneProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Projects')
    .select()
    .in('status', ['PAYED', 'CANCELED']);

  if (error) throw error;

  return (data as Database['public']['Tables']['Projects']['Row'][]) ?? [];
}

export async function getProject(id: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .eq('id', Number(id)) // ⚠️ important si id = number
    .single();

  if (error) throw error;

  return data as Database['public']['Tables']['Projects']['Row'];
}

export async function updateProject(
  id: number,
  data: Database['public']['Tables']['Projects']['Update'],
) {
  const supabase = await createClient();
  const { error } = await supabase.from('Projects').update(data).eq('id', id);
  if (error) throw error;
}

export async function createNewProject(
  data: Database['public']['Tables']['Projects']['Insert'],
) {
  const supabase = await createClient();
  const { data: newProject, error } = await supabase
    .from('Projects')
    .insert(data)
    .select()
    .single();
  if (error) throw error;

  return newProject;
}

export async function getProjectsByClientId(clientId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('Projects')
    .select('*')
    .eq('clientId', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data as Database['public']['Tables']['Projects']['Row'][];
}
