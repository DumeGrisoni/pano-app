// components/ProductsList.tsx

import { getDoneProjects } from '@/lib/data/projects';
import { projectColumns } from './project-columns';
import { DataTable } from './project-table-data';

export default async function PastProjectList() {
  const projects = await getDoneProjects();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={projectColumns} data={projects} />
    </div>
  );
}
