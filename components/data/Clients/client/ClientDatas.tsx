'use client';
import { Database } from '@/database.types';
import React from 'react';
import { UpdateClientForm } from './UpdateClientForm';

const ClientDatas = ({
  client,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
}) => {
  return <UpdateClientForm client={client} />;
};

export default ClientDatas;
