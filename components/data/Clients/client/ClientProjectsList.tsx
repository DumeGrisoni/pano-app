'use client';
import { Button } from '@/components/ui/button';
import { Database } from '@/database.types';
import React, { Suspense, useState } from 'react';
import { AddProjectForm } from '../../Projects/AddProjectForm';
import { X } from 'lucide-react';
import ClientProjectTable from './ClientProjectTable';

const ClientProjectsList = ({
  client,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 justify-center items-center w-full">
      {!modalOpen && (
        <Button onClick={() => setModalOpen(!modalOpen)}>
          Ajouter un Projet
        </Button>
      )}

      {modalOpen && (
        <div className="flex gap-2">
          <AddProjectForm client={client} />
          <Button onClick={() => setModalOpen(!modalOpen)} size={'icon'}>
            <X />
          </Button>
        </div>
      )}
      <Suspense fallback={<div>Chargement...</div>}>
        <ClientProjectTable />
      </Suspense>
    </div>
  );
};

export default ClientProjectsList;
