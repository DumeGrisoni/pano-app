'use client';

import { Database } from '@/database.types';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, EyeIcon } from 'lucide-react';
import Link from 'next/link';

import { ProjectStatus } from '@/lib/project-status';
import { StatusBadge } from '../../BadgeStatus';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const projectColumns: ColumnDef<
  Database['public']['Tables']['Projects']['Row']
>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Titre',
  },
  {
    accessorKey: 'limitDate',
    header: 'Date Limite',
  },
  {
    accessorKey: 'clientFullName',
    header: 'Client',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as ProjectStatus;
      return <StatusBadge status={status} />;
    },
  },
  {
    id: 'see',
    header: () => <div className="text-center">Voir</div>,
    cell: ({ row }) => {
      const project = row.original;

      return (
        <div className="flex justify-center">
          <Link
            href={`/protected/projects/${project.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded-md p-2 border-input hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-in-out"
          >
            <EyeIcon className=" h-4 w-4" />
          </Link>
        </div>
      );
    },
  },
];
