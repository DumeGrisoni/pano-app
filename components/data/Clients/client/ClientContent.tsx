import { getClient } from '@/lib/data/clients';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';
import { UpdateClientForm } from './UpdateClientForm';
import ClientProjectsList from './ClientProjectsList';

export default async function ClientContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await getClient(id);

  return (
    <div className="flex items-center justify-center">
      <Tabs
        defaultValue="clientList"
        className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="clientList">Coordonnées</TabsTrigger>
          <TabsTrigger value="CreateClient">Projets</TabsTrigger>
        </TabsList>
        <TabsContent value="clientList" className="w-full">
          <Suspense fallback={<div>Chargement...</div>}>
            <UpdateClientForm client={client} />
          </Suspense>
        </TabsContent>
        <TabsContent
          value="CreateClient"
          className="w-full flex items-center justify-center"
        >
          <Suspense fallback={<div>Chargement...</div>}>
            <ClientProjectsList client={client} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
