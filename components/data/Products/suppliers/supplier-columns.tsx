'use client';

import { Button } from '@/components/ui/button';
import { Database } from '@/database.types';
import { getDecryptedPassword } from '@/lib/data/suppliers';
import { ColumnDef } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<
  Database['public']['Tables']['Suppliers']['Row']
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
    accessorKey: 'phone',
    header: 'TEL',
  },
  {
    accessorKey: 'website',
    header: 'Site web',
    cell: ({ row }) => {
      const website = row.original.website;

      if (!website) return null;

      const url = website.startsWith('http') ? website : `https://${website}`;

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {website}
        </a>
      );
    },
  },
  {
    accessorKey: 'connectEmail',
    header: 'Mail de connexion',
  },
  {
    id: 'password',
    header: () => <div className="text-center">Mot de passe</div>,
    cell: ({ row }) => {
      const supplier = row.original;
      const datas = supplier.connectEmail;

      const handleCopy = async () => {
        try {
          const password = await getDecryptedPassword(supplier.id);

          await navigator.clipboard.writeText(password);

          toast.success('Mot de passe copié');
        } catch (err) {
          toast.error('Erreur');
        }
      };

      return (
        <div className="flex justify-center">
          <Button onClick={handleCopy} size={'icon'}>
            <Copy />
          </Button>
        </div>
      );
    },
  },
];
