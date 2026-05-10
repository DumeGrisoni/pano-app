import ClientContent from '@/components/data/Clients/client/ClientContent';
import { Suspense } from 'react';

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex items-center justify-center w-[50vw] mx-auto">
      <Suspense fallback={<div>Chargement...</div>}>
        <ClientContent params={params} />
      </Suspense>
    </div>
  );
}
