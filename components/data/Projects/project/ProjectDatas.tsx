'use client';
import { Database } from '@/database.types';
import React from 'react';
import { UpdateProjectForm } from './UpdateProjectDatasForm';

const ClientDatas = ({
  client,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
}) => {
  return <UpdateProjectForm project={project} />;
};

export default ClientDatas;
