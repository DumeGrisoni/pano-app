'use client';

import { getProjectsByClientId } from '@/lib/data/projects';
import { clientProjectColumns } from './clientProject-columns';
import { DataTable } from './clientProject-table-data';
import { useEffect, useState } from 'react';
import { Database } from '@/database.types';
import { usePathname } from 'next/navigation';

export default function ClientProjectTable() {
  const params = usePathname();

  const id = params.split('/').pop();

  const [projects, setProjects] = useState<
    Database['public']['Tables']['Projects']['Row'][]
  >([] as Database['public']['Tables']['Projects']['Row'][]);

  useEffect(() => {
    async function fetchProjects() {
      const projects = await getProjectsByClientId(Number(id));
      setProjects(projects);
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log(projects);
  }, [projects]);

  return (
    <div className="mx-auto py-10 w-full ">
      <DataTable columns={clientProjectColumns} data={projects} />
    </div>
  );
}
