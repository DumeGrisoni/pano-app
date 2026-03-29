// components/ProductsList.tsx
import { getProducts } from '@/lib/data/products';
import { DataTable } from './table-data';
import { columns } from './columns';

export default async function ProductsList() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-10">
      <div className="text-2xl">hello</div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}
