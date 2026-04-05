import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddProjectForm } from '@/components/data/Projects/AddProjectForm';
import ProjectList from '@/components/data/Projects/ProjectDatasList';

export default async function Products() {
  if (!ProjectList) return <div>Aucun produit disponible</div>;

  return (
    <div className="flex w-[50vw] items-center justify-center">
      <Suspense fallback={<div>Chargement...</div>}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
