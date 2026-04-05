import ProductsList from '@/components/data/Products/ProductsList';
import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddProductForm } from '@/components/data/Products/AddProductForm';
import SupplierList from '@/components/data/Products/suppliers/SupplierList';

export default async function Products() {
  if (!ProductsList) return <div>Aucun produit disponible</div>;

  return (
    <div className="flex items-center justify-center">
      <Tabs
        defaultValue="productList"
        className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center "
      >
        <TabsList className="mb-6">
          <TabsTrigger value="productList">Fournitures</TabsTrigger>
          <TabsTrigger value="Suppliers">Fournisseurs</TabsTrigger>
        </TabsList>
        <TabsContent value="productList" className="w-full">
          <Suspense fallback={<div>Chargement...</div>}>
            <ProductsList />
          </Suspense>
        </TabsContent>
        <TabsContent value="Suppliers">
          <SupplierList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
