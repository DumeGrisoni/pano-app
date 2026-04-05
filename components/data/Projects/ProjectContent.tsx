import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';

import { AddProjectForm } from './AddProjectForm';
import { getProject } from '@/lib/data/projects';
import { UpdateProjectForm } from './project/UpdateProjectDatasForm';

export default async function ClientContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await getProject(id);

  return (
    <div className="flex items-center justify-center">
      <Tabs
        defaultValue="projectList"
        className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="projectList">Coordonnées</TabsTrigger>
          <TabsTrigger value="CreateProject">Projets</TabsTrigger>
        </TabsList>
        <TabsContent value="projectList" className="w-full">
          <Suspense fallback={<div>Chargement...</div>}>
            <UpdateProjectForm project={project} />
          </Suspense>
        </TabsContent>
        <TabsContent
          value="CreateProject"
          className="w-full flex items-center justify-center"
        >
          <AddProjectForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
