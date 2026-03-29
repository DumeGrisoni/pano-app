import { Suspense } from 'react';
import { getProducts } from '@/lib/data/products';

export default async function Products() {
  const product = await getProducts();
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <div>{product.title}</div>
    </Suspense>
  );
}
