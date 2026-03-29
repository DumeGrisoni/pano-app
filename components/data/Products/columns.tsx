'use client';

import { Database } from '@/database.types';
import { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

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
];
