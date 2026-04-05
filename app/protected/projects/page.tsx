import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectList from '@/components/data/Projects/ProjectDatasList';
import PastProjectList from '@/components/data/Projects/project/pastProjects/PastProjectsList';

export default async function Products() {
  if (!ProjectList) return <div>Aucun produit disponible</div>;

  return (
    <div>
      <div className="flex items-center justify-center">
        <Tabs
          defaultValue="clientList"
          className="lg:w-[80vw] md:w-[70vw] mx-auto flex items-center justify-center"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="clientList">Projets en cours</TabsTrigger>
            <TabsTrigger value="CreateClient">Projets terminés</TabsTrigger>
          </TabsList>
          <TabsContent value="clientList" className="w-full">
            <Suspense fallback={<div>Chargement...</div>}>
              <ProjectList />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="CreateClient"
            className="w-full flex items-center justify-center"
          >
            <PastProjectList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
