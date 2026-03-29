import ProductsList from '@/components/data/Products/ProductsList';
import { Suspense } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function Products() {
  if (!ProductsList) return <div>Products not found</div>;

  console.log(ProductsList);
  return (
    <div className="flex items-center justify-center">
      <Tabs
        defaultValue="productList"
        className="lg:w-[80vw] md:w-[70vw]  mx-auto flex items-center justify-center"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="productList">Liste des produits</TabsTrigger>
          <TabsTrigger value="CreateProduct">Créer un produit</TabsTrigger>
        </TabsList>
        <TabsContent value="productList" className="w-full">
          <span className="w-full bg-red-500">hhhh</span>
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductsList />
          </Suspense>
        </TabsContent>
        <TabsContent value="CreateProduct">
          <div>Créer un produit</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
