// components/ProductsList.tsx

import { DataTable } from './project-table-data';
import { projectColumns } from './project-columns';
import { getAllProjects } from '@/lib/data/projects';

export default async function ProjectList() {
  const projects = await getAllProjects();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={projectColumns} data={projects} />
    </div>
  );
}
