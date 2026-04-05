import ClientContent from '@/components/data/Clients/client/ClientContent';
import { Suspense } from 'react';

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ClientContent params={params} />
    </Suspense>
  );
}
