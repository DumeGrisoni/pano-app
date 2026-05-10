import ProductContent from '@/components/data/Products/product/Page';
import { Suspense } from 'react';

export default async function ProductPage() {
  return (
    <div className="flex items-center justify-center w-[50vw]">
      <Suspense fallback={<div>Chargement...</div>}>
        <ProductContent />
      </Suspense>
    </div>
  );
}
