import { PagePDF } from '@/components/data/Projects/project/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { changeDateFormat, formatDateData } from './formatDate';
import { Database } from '@/database.types';

export function ProjectPDF({
  client,
  project,
  metadata,
  type,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
  project: Database['public']['Tables']['Projects']['Row'];
  metadata: any;
  type: string;
}) {
  return (
    <div className="">
      {/* PROD */}
      {(type === 'prod' || type === 'all') && metadata.isProd && (
        <PagePDF>
          <h1 className="mb-2 text-center font-bold text-2xl">Production</h1>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-2">
                {project.title}
              </CardTitle>
              <CardDescription className="text-center flex flex-col gap-2">
                <div className="flex items-center justify-center gap-6">
                  <p>
                    {client.surname} {client.name} - {client.entreprise}
                  </p>
                  <p>
                    {client.address} - {client.postalCode} {client.city}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <p>
                    Date Limite :{' '}
                    {changeDateFormat(project.limitDate as string)}
                  </p>
                  <p>
                    0{client.phone} - {client.mail}
                  </p>
                </div>
              </CardDescription>

              <Separator />
            </CardHeader>

            {/* 🔥 WRAPPER GLOBAL */}
            <div className="flex flex-col flex-1 w-full">
              {/* 🔥 PRODUITS (2/3) */}
              <div className="flex-1 overflow-hidden">
                <CardContent className="w-full">
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Produits
                  </h2>
                  <Separator />

                  {metadata.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 items-center border-b py-2 text-sm"
                    >
                      <div className="truncate">{item.productName}</div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-right">
                        {item.width} x {item.height}
                      </div>
                    </div>
                  ))}

                  <div className=" mt-4 border rounded-md p-4 w-full">
                    <p className="mt-4">{project.note}</p>
                  </div>
                </CardContent>
              </div>

              {/* 🔥 NOTE (1/3) */}
              <div className="flex-1 flex flex-col">
                <CardFooter className="flex flex-col w-full h-full">
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Note
                  </h2>
                  <Separator />
                  <div className="flex-1 border rounded-md p-4 w-full">
                    <p className="mt-4">{metadata.prodNote}</p>
                  </div>
                </CardFooter>
              </div>
            </div>
          </Card>
        </PagePDF>
      )}

      {/* GRAPHISME */}
      {(type === 'graphisme' || type === 'all') && metadata.isGraphisme && (
        <PagePDF>
          <h2 className="text-2xl font-semibold mb-4 text-center ">Visuel</h2>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-4">
                {project.clientFullName} - {project.title}
              </CardTitle>
              <CardDescription className="text-center mb-2 flex flex-col gap-2 ">
                <div className="flex items-center justify-center gap-6">
                  <p>
                    {client.surname} {client.name} - {client.entreprise}
                  </p>
                  <p>
                    {client.address} - {client.postalCode} {client.city}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <p>
                    Date Limite :{' '}
                    {changeDateFormat(project.limitDate as string)}
                  </p>
                  <p>
                    0{client.phone} - {client.mail}
                  </p>
                </div>
              </CardDescription>
              <Separator />
            </CardHeader>
            <CardContent className="w-full">
              {/* 🔥 WRAPPER GLOBAL */}
              <div className="flex flex-col flex-1 w-full gap-6 ">
                <div className=" mt-4 border rounded-md p-4 w-full">
                  <p className="mt-4">{project.note}</p>
                </div>
                {/* 🔥 NOTE */}
                <h2 className="text-xl  font-semibold mb-4 text-center">
                  Note de Visuel
                </h2>

                <div className="flex-1 border rounded-md p-4">
                  <p className="mt-4">{metadata.graphismeNote}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PagePDF>
      )}

      {/* POSE */}
      {(type === 'pose' || type === 'all') && metadata.isPose && (
        <PagePDF>
          <h1 className="mb-4 text-center font-bold text-2xl ">Pose</h1>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl text-center mb-4">
                {project.clientFullName} - {project.title}
              </CardTitle>
              <CardDescription className="text-center  flex flex-col gap-2">
                <div className="flex items-center justify-center gap-6">
                  <p>
                    {client.surname} {client.name} - {client.entreprise}
                  </p>
                  <p>
                    {client.address} - {client.postalCode} {client.city}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <p>
                    Date Limite :{' '}
                    {changeDateFormat(project.limitDate as string)}
                  </p>
                  <p>
                    0{client.phone} - {client.mail}
                  </p>
                </div>
              </CardDescription>
              <Separator />
            </CardHeader>

            {/* 🔥 WRAPPER GLOBAL */}
            <div className="flex flex-col flex-1 w-full mt-4">
              {/* 🔥 PRODUITS (2/3) */}
              <div className="flex-1 overflow-hidden">
                <CardContent className="w-full">
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Produits
                  </h2>
                  <Separator />

                  <p>{client.address}</p>

                  {metadata.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 items-center border-b py-2 text-sm"
                    >
                      <div className="truncate">{item.productName}</div>
                      <div className="text-center">{item.quantity}</div>
                      <div className="text-right">
                        {item.width} x {item.height}
                      </div>
                    </div>
                  ))}

                  <div className=" mt-4 border rounded-md p-4 w-full">
                    <p className="mt-4">{project.note}</p>
                  </div>
                </CardContent>
              </div>

              {/* 🔥 NOTE (1/3) */}
              <div className="flex-1 flex flex-col">
                <CardFooter className="flex flex-col w-full h-full">
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Détails de pose
                  </h2>
                  <Separator />
                  <div className="flex-1 border rounded-md p-4 w-full">
                    <p className="mt-4">{metadata.poseNote}</p>
                  </div>
                </CardFooter>
              </div>
            </div>
          </Card>
        </PagePDF>
      )}
    </div>
  );
}
