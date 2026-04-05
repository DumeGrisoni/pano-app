import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddClientForm } from '@/components/data/Clients/AddClientForm';
import ClientsList from '@/components/data/Clients/ClientsList';

export default async function Clients() {
  if (!ClientsList) return <div>Aucun client disponible</div>;

  return (
    <div className="flex items-center justify-center">
      <Tabs
        defaultValue="clientList"
        className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="clientList">Liste des clients</TabsTrigger>
          <TabsTrigger value="CreateClient">Ajouter un client</TabsTrigger>
        </TabsList>
        <TabsContent value="clientList" className="w-full">
          <Suspense fallback={<div>Chargement...</div>}>
            <ClientsList />
          </Suspense>
        </TabsContent>
        <TabsContent
          value="CreateClient"
          className="w-full flex items-center justify-center"
        >
          <AddClientForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
