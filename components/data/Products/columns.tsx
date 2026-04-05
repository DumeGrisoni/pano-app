'use client';

import { Button } from '@/components/ui/button';
import { Database } from '@/database.types';
import { useCart } from '@/hooks/useCart';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<
  Database['public']['Tables']['Products']['Row']
>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Nom',
  },
  {
    accessorKey: 'price',
    header: 'Prix',
  },
  {
    accessorKey: 'supplierName',
    header: 'Fournisseur',
  },
  {
    accessorKey: 'ref',
    header: 'Reference',
  },
  {
    id: 'add',
    header: () => <div className="text-center">Commande</div>,
    cell: ({ row }) => {
      const product = row.original;

      const addItem = useCart((state) => state.addItem);

      return (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              addItem({
                product_id: Number(product.id),
                product_name: product.title || '',
                supplier_id: Number(product.supplier), // ⚠️ IMPORTANT
                supplier_name: product.supplierName || '',
                quantity: 1,
                product_ref: product.ref || '',
              });
            }}
          >
            Ajouter
          </Button>
        </div>
      );
    },
  },
];
