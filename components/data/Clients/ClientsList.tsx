// components/ProductsList.tsx

import { DataTable } from './client-table-data';
import { clientColumns } from './client-columns';
import { getAllClients } from '@/lib/data/clients';

export default async function ClientsList() {
  const clients = await getAllClients();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={clientColumns} data={clients} />
    </div>
  );
}
