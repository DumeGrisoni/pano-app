'use client';
import { getProducts } from '@/lib/data/products';
import { DataTable } from './table-data';
import { columns } from './supplier-columns';
import { AddSupplierForm } from './AddSupplierForm';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Database } from '@/database.types';
import { X } from 'lucide-react';
import { getAllSuppliers } from '@/lib/data/suppliers';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<
    Database['public']['Tables']['Suppliers']['Row'][]
  >([] as Database['public']['Tables']['Suppliers']['Row'][]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchSuppliers() {
      const suppliers = await getAllSuppliers();
      setSuppliers(suppliers);
    }
    fetchSuppliers();
  }, []);

  if (!suppliers) return <div>Aucun fournisseur disponible</div>;

  return (
    <div className="container w-[50vw] mx-auto py-10 flex items-center justify-center flex-col gap-8">
      {!open && (
        <Button onClick={() => setOpen(!open)}>Ajouter un fournisseur</Button>
      )}
      {open && (
        <div className="flex gap-6 w-full px-4 items-start justify-center">
          <Button onClick={() => setOpen(!open)}>
            <X />
          </Button>
          <AddSupplierForm />
        </div>
      )}

      <DataTable columns={columns} data={suppliers} />
    </div>
  );
}
