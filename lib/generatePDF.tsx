import { PagePDF } from '@/components/data/Projects/project/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { changeDateFormat } from './formatDate';
import { Database } from '@/database.types';

function CheckLine({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{checked ? '☑' : '☐'}</span>
      <span>{label}</span>
    </div>
  );
}

function formatFinition(value?: string) {
  switch (value) {
    case 'brut':
      return 'Brut';
    case 'oeillets_500':
      return 'Œillets 500mm';
    case 'oeillets_1000':
      return 'Œillets 1000mm';
    case 'oeillets_coins':
      return 'Œillets coins';
    default:
      return value;
  }
}

function getItemName(item: any) {
  return item.isCustom ? item.customName : item.productName;
}

function getItemOptions(item: any) {
  const options: string[] = [];

  if (item.width) options.push(`Largeur : ${item.width} mm`);
  if (item.height) options.push(`Hauteur : ${item.height} mm`);
  if (item.length) options.push(`Longueur : ${item.length} mm`);
  if (item.depth) options.push(`Profondeur : ${item.depth} mm`);

  if (item.option1) options.push(`Option 1 : ${item.option1}`);
  if (item.option2) options.push(`Option 2 : ${item.option2}`);

  if (item.goodieOptions?.option1) {
    options.push(`Couleur / finition : ${item.goodieOptions.option1}`);
  }

  if (item.goodieOptions?.option2) {
    options.push(`Taille / autre : ${item.goodieOptions.option2}`);
  }

  if (item.goodieOptions?.placement) {
    options.push(`Position marquage : ${item.goodieOptions.placement}`);
  }

  if (item.diffusant !== undefined && item.diffusant !== null) {
    options.push(`Diffusant : ${item.diffusant ? 'Oui' : 'Non'}`);
  }

  if (item.bacheOptions?.finition) {
    options.push(`Finition : ${formatFinition(item.bacheOptions.finition)}`);
  }

  if (item.cutOptions?.color) {
    options.push(`Couleur : ${item.cutOptions.color}`);
  }

  if (item.cutOptions?.ral) {
    options.push(`RAL : ${item.cutOptions.ral}`);
  }

  if (item.tintedFilmOptions?.pose) {
    options.push(
      `Pose film : ${
        item.tintedFilmOptions.pose === 'inter' ? 'Intérieur' : 'Extérieur'
      }`,
    );
  }

  if (item.tintedFilmOptions?.ref) {
    options.push(`Réf film : ${item.tintedFilmOptions.ref}`);
  }

  return options;
}

function chunkArray<T>(array: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

function ProjectHeader({
  client,
  project,
  metadata,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
  project: Database['public']['Tables']['Projects']['Row'];
  metadata: any;
}) {
  return (
    <>
      <CardHeader
        className="rounded-md"
        style={{
          backgroundColor: '#374151',
          color: 'white',
          border: '1px solid #1f2937',

          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <CardTitle className="text-2xl text-center mb-3">
          {project.title}
        </CardTitle>
        <Separator className="bg-white" />
        <CardDescription className="text-center flex flex-row justify-between ">
          <div className="flex flex-col text-white gap-2 mt-2">
            <p className="flex justify-between w-full gap-4">
              <span>Entreprise :</span>
              <span>{client.entreprise}</span>
            </p>

            <p className=" flex justify-between w-full gap-4">
              <span>Nom :</span>
              <span>
                {client.name} {client.surname}
              </span>
            </p>
          </div>

          <div className="flex flex-col text-white gap-2 mt-2">
            <p className="text-sm flex justify-between w-full gap-4">
              <span>MAIL :</span>
              <span>{client.mail ? client.mail : 'Non renseigné'}</span>
            </p>

            <p className="text-sm flex justify-between w-full gap-4">
              <span>TEL :</span>
              <span>{client.phone ? client.phone : 'Non renseigné'}</span>
            </p>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-12 text-sm">
          <CheckLine label="Fichier fourni" checked={metadata.isFile} />
          <CheckLine label="BAT validé" checked={metadata.isBAT} />
        </div>
        <Separator />
      </CardContent>
    </>
  );
}

export function ProjectPDF({
  client,
  project,
  metadata,
}: {
  client: Database['public']['Tables']['Clients']['Row'];
  project: Database['public']['Tables']['Projects']['Row'];
  metadata: any;
  type?: string;
}) {
  const items = metadata.items ?? [];

  return (
    <div className="pdf-document ">
      <div className="pdf-page flex flex-col gap-5">
        <ProjectHeader client={client} project={project} metadata={metadata} />

        <div className="flex flex-col gap-5">
          <div className="border rounded-md">
            <h2
              className="text-xl font-semibold  text-center  rounded-t-md py-2"
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #1f2937',

                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              Production
            </h2>

            {items.map((item: any, index: number) => {
              const options = getItemOptions(item);

              return (
                <div
                  key={index}
                  className="pdf-avoid-break px-2 flex justify-between gap-6  py-4 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{getItemName(item)}</span>
                    <span className="text-xs">Quantité : {item.quantity}</span>
                  </div>

                  <div className="flex flex-col gap-1 items-end text-right">
                    {options.length > 0 ? (
                      options.map((option, i) => (
                        <span key={i} className="text-xs">
                          {option}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}

                    {item.plastifEnabled && (
                      <div className="flex items-center gap-2 text-xs">
                        <span>☑ Plastif</span>
                        {item.plastifProductName && (
                          <span>{item.plastifProductName}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col ">
            <h2
              className="text-lg font-semibold text-center rounded-t-md py-2"
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #1f2937',

                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              Description
            </h2>
            <div className="pdf-avoid-break border rounded-b-md p-4">
              <p className="text-sm whitespace-pre-wrap">{project.note}</p>
            </div>
          </div>
          <div className="flex flex-col ">
            <h2
              className="text-lg font-semibold text-center rounded-t-md py-2"
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #1f2937',

                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              Date limite
            </h2>
            <div className="pdf-avoid-break border rounded-md p-4">
              <p className="text-sm text-center">
                {project.limitDate
                  ? changeDateFormat(project.limitDate as string)
                  : 'Non renseignée'}
              </p>
            </div>
          </div>

          <div className="border rounded-md">
            <div
              className="pdf-avoid-break border rounded-t-md p-4 flex flex-col gap-3"
              style={{
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #1f2937',

                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <div className="flex items-center gap-8">
                <CheckLine label="Pose" checked={metadata.isPose} />

                {metadata.isPose && (
                  <>
                    <p className="">
                      Date de pose :{' '}
                      {metadata.poseDate
                        ? changeDateFormat(metadata.poseDate.split('T')[0])
                        : 'Non renseignée'}
                    </p>

                    <CheckLine label="Nacelle" checked={metadata.isNacelle} />
                  </>
                )}
              </div>
            </div>
            <p className="text-center py-4 mt-2">
              {metadata.isPose && metadata.poseAdresse && (
                <p className="">Adresse de pose : {metadata.poseAdresse}</p>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
