import CommandeList from '@/components/data/Commandes/CommandeList';
import PastCommandesList from '@/components/data/Commandes/PastCommandesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { Suspense } from 'react';

const Orders = async () => {
  return (
    <div>
      <div className="flex items-center justify-center">
        <Tabs
          defaultValue="clientList"
          className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="clientList">Commandes Actuelles</TabsTrigger>
            <TabsTrigger value="CreateClient">Commandes Passées</TabsTrigger>
          </TabsList>
          <TabsContent value="clientList" className="w-full">
            <Suspense fallback={<div>Chargement...</div>}>
              <CommandeList />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="CreateClient"
            className="w-full flex items-center justify-center"
          >
            <PastCommandesList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;
