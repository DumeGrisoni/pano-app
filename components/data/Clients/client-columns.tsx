'use client';

import { Button } from '@/components/ui/button';
import { Database } from '@/database.types';
import { ColumnDef } from '@tanstack/react-table';
import { EyeIcon } from 'lucide-react';
import Link from 'next/link';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const clientColumns: ColumnDef<
  Database['public']['Tables']['Clients']['Row']
>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Nom',
  },
  {
    accessorKey: 'surname',
    header: 'Prénom',
  },
  {
    accessorKey: 'entreprise',
    header: 'Entreprise',
  },
  {
    accessorKey: 'siret',
    header: 'Siret',
  },
  {
    id: 'see',
    header: () => <div className="text-center">Voir</div>,
    cell: ({ row }) => {
      const client = row.original;

      return (
        <div className="flex justify-center">
          <Link
            href={`/protected/clients/${client.id}`}
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
