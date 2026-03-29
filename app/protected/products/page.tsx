import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function ProductsData() {
  const supabase = await createClient();
  const { data: products } = await supabase.from('Products').select();

  return <pre>{JSON.stringify(products, null, 2)}</pre>;
}

export default function Products() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsData />
    </Suspense>
  );
}
