'use client';
import { getProducts } from '@/lib/data/products';
import { DataTable } from './table-data';
import { columns } from './columns';
import { AddProductForm } from './AddProductForm';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Database } from '@/database.types';
import { X } from 'lucide-react';

export default function ProductsList() {
  const [products, setProducts] = useState<
    Database['public']['Tables']['Products']['Row'][]
  >([] as Database['public']['Tables']['Products']['Row'][]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      const products = await getProducts();
      setProducts(products);
    }
    fetchProducts();
  }, []);

  if (!products) return <div>Aucun produit disponible</div>;

  return (
    <div className="container w-full mx-auto py-10 flex items-center justify-center flex-col gap-8">
      {!open && (
        <Button onClick={() => setOpen(!open)}>Ajouter un produit</Button>
      )}
      {open && (
        <div className="flex gap-6  items-start justify-center">
          <Button onClick={() => setOpen(!open)}>
            <X />
          </Button>
          <AddProductForm />
        </div>
      )}

      <DataTable columns={columns} data={products} />
    </div>
  );
}
