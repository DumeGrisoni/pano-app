'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import { getAllProjects } from '@/lib/data/projects';
import { Database } from '@/database.types';

import { PROJECT_STATUS, COLOR_MAP, ProjectStatus } from '@/lib/project-status';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Project = Database['public']['Tables']['Projects']['Row'];

const GRAPHISTS = [
  {
    name: 'Dumè',
    colorClass: 'bg-rose-500 text-white',
  },
  {
    name: 'Manu',
    colorClass: 'bg-teal-500 text-white',
  },
  {
    name: 'Matt',
    colorClass: 'bg-sky-500 text-white',
  },
] as const;

type DashboardItem =
  | { type: 'status'; key: ProjectStatus }
  | { type: 'graphists-row'; key: 'GRAPHISTS' };

const DASHBOARD_SECTIONS = [
  {
    title: 'Devis',
    items: [
      { type: 'status', key: 'PENDING_QUOTE' },
      { type: 'status', key: 'QUOTED' },
    ],
  },
  {
    title: 'Conception',
    items: [
      { type: 'status', key: 'IN_DESIGN' },
      { type: 'graphists-row', key: 'GRAPHISTS' },
    ],
  },
  {
    title: 'Production',
    items: [
      { type: 'status', key: 'IN_PRODUCTION' },
      { type: 'status', key: 'IN_COMMAND' },
    ],
  },
  {
    title: 'Livraison / règlement',
    items: [
      { type: 'status', key: 'TO_DELIVER' },
      { type: 'status', key: 'DONE' },
    ],
  },
] satisfies {
  title: string;
  items: DashboardItem[];
}[];

function sortProjectsByLimitDate(projects: Project[]) {
  return [...projects].sort((a, b) => {
    if (!a.limitDate && !b.limitDate) return 0;
    if (!a.limitDate) return 1;
    if (!b.limitDate) return -1;

    return new Date(a.limitDate).getTime() - new Date(b.limitDate).getTime();
  });
}

function isActiveProject(project: Project) {
  return project.status !== 'PAYED' && project.status !== 'CANCELED';
}

function getProjectWho(project: Project) {
  return String((project as any).Who ?? '').trim();
}

function getProjectFolder(project: Project) {
  const metadata = (project.metadata ?? {}) as {
    folderMonth?: string;
    folderNumber?: string;
  };

  if (!metadata.folderMonth || !metadata.folderNumber) return '—';

  return `${metadata.folderMonth}-${metadata.folderNumber}`;
}

function ProjectMiniTable({
  projects,
  maxHeight = 'max-h-[260px]',
  showStatus = false,
  showFolder = false,
  headerColorClass = 'bg-background text-foreground',
  compactViewColumn = false,
}: {
  projects: Project[];
  maxHeight?: string;
  showStatus?: boolean;
  showFolder?: boolean;
  headerColorClass?: string;
  compactViewColumn?: boolean;
}) {
  const colSpan = showFolder ? 5 : 4;
  const dateOrStatusLabel = showStatus ? 'Statut' : 'Date limite';

  const projectWidth = compactViewColumn ? 'w-[38%]' : 'w-[34%]';
  const clientWidth = compactViewColumn ? 'w-[34%]' : 'w-[28%]';
  const dateWidth = compactViewColumn
    ? 'w-[25%]'
    : showStatus
      ? 'w-[24%]'
      : showFolder
        ? 'w-[18%]'
        : 'w-[28%]';

  const viewWidth = compactViewColumn ? 'w-[32px]' : 'w-[8%]';
  const cellPadding = compactViewColumn ? 'px-1 py-2' : '';

  return (
    <CardContent className="p-0">
      <Table className="table-fixed w-full">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow
              className={`border-b ${headerColorClass} hover:!bg-inherit`}
            >
              <TableHead
                className={`${projectWidth} ${cellPadding} text-white ${headerColorClass}`}
              >
                Projet
              </TableHead>

              <TableHead
                className={`${clientWidth} ${cellPadding} text-white ${headerColorClass}`}
              >
                Client
              </TableHead>

              <TableHead
                className={`${dateWidth} ${cellPadding} text-white ${headerColorClass}`}
              >
                {dateOrStatusLabel}
              </TableHead>

              {showFolder && (
                <TableHead
                  className={`w-[12%] ${cellPadding} text-white ${headerColorClass}`}
                >
                  Dossier
                </TableHead>
              )}

              <TableHead
                className={`${viewWidth} ${cellPadding} text-center text-white ${headerColorClass}`}
              >
                Voir
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </Table>

      <div className={`${maxHeight} overflow-y-auto`}>
        <Table className="table-fixed w-full">
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const statusConfig =
                  PROJECT_STATUS[project.status as ProjectStatus];

                return (
                  <TableRow key={project.id}>
                    <TableCell
                      className={`${projectWidth} font-medium whitespace-normal break-words`}
                    >
                      {project.title}
                    </TableCell>

                    <TableCell
                      className={`${clientWidth} whitespace-normal break-words`}
                    >
                      {project.entreprise || project.clientFullName}
                    </TableCell>

                    {showStatus ? (
                      <TableCell className="w-[24%] whitespace-normal break-words">
                        {statusConfig?.label ?? project.status ?? '—'}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell
                          className={showFolder ? 'w-[18%]' : 'w-[28%]'}
                        >
                          {project.limitDate
                            ? new Date(project.limitDate).toLocaleDateString(
                                'fr-FR',
                              )
                            : '—'}
                        </TableCell>

                        {showFolder && (
                          <TableCell className="w-[12%] font-medium">
                            {getProjectFolder(project)}
                          </TableCell>
                        )}
                      </>
                    )}

                    <TableCell className={`${viewWidth} text-center px-0`}>
                      <Link
                        href={`/protected/projects/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className={
                            compactViewColumn ? 'h-7 w-7 p-0' : undefined
                          }
                        >
                          <Eye
                            className={
                              compactViewColumn ? 'h-3.5 w-3.5' : 'w-4 h-4'
                            }
                          />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="h-16 text-center text-muted-foreground"
                >
                  Aucun projet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}

export default function Home() {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    async function fetchProjects() {
      const data = await getAllProjects();
      setProjects(data);
    }

    fetchProjects();
  }, []);

  const activeProjects = React.useMemo(() => {
    return projects.filter(isActiveProject);
  }, [projects]);

  const projectsByGraphist = React.useMemo(() => {
    return GRAPHISTS.reduce(
      (acc, graphist) => {
        acc[graphist.name] = sortProjectsByLimitDate(
          activeProjects.filter(
            (project) =>
              project.status === 'IN_DESIGN' &&
              getProjectWho(project) === graphist.name,
          ),
        );

        return acc;
      },
      {} as Record<(typeof GRAPHISTS)[number]['name'], Project[]>,
    );
  }, [activeProjects]);

  const projectsByStatus = React.useMemo(() => {
    const grouped = {} as Record<ProjectStatus, Project[]>;

    Object.keys(PROJECT_STATUS).forEach((status) => {
      grouped[status as ProjectStatus] = [];
    });

    activeProjects.forEach((project) => {
      const status = project.status as ProjectStatus;
      const who = getProjectWho(project);

      if (status === 'IN_DESIGN' && who) return;

      if (grouped[status]) {
        grouped[status].push(project);
      }
    });

    Object.keys(grouped).forEach((status) => {
      grouped[status as ProjectStatus] = sortProjectsByLimitDate(
        grouped[status as ProjectStatus],
      );
    });

    return grouped;
  }, [activeProjects]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-8 p-6">
      <h1 className="text-2xl font-bold text-center tracking-wide">
        PROJETS EN COURS
      </h1>

      <div className="flex w-full flex-col gap-20">
        {DASHBOARD_SECTIONS.map((section) => (
          <section key={section.title} className="w-full flex flex-col gap-5">
            <div className="flex w-full items-center gap-4 mb-6">
              <h2 className="shrink-0 text-xl font-bold tracking-wide">
                {section.title}
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid w-full grid-cols-1 xl:grid-cols-2 gap-6">
              {section.items.map((item) => {
                if (item.type === 'graphists-row') {
                  return (
                    <div
                      key="graphists-row"
                      className="xl:col-span-2 grid w-full grid-cols-1 md:grid-cols-3 gap-2"
                    >
                      {GRAPHISTS.map((graphist) => {
                        const graphistProjects =
                          projectsByGraphist[graphist.name];

                        return (
                          <Card
                            key={graphist.name}
                            className="w-full overflow-hidden border shadow-sm"
                          >
                            <CardHeader
                              className={`${graphist.colorClass} border-b py-3`}
                            >
                              <CardTitle className="flex items-center justify-between text-base">
                                <span>{graphist.name}</span>
                                <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                                  {graphistProjects.length}
                                </span>
                              </CardTitle>
                            </CardHeader>

                            <ProjectMiniTable
                              projects={graphistProjects}
                              maxHeight="max-h-[400px]"
                              showStatus={false}
                              compactViewColumn
                              headerColorClass={graphist.colorClass}
                            />
                          </Card>
                        );
                      })}
                    </div>
                  );
                }

                const status = item.key;
                const config = PROJECT_STATUS[status];
                const statusProjects = projectsByStatus[status];
                const colorClass = COLOR_MAP[config.color];

                return (
                  <Card
                    key={status}
                    className="w-full overflow-hidden border shadow-sm"
                  >
                    <CardHeader
                      className={`${colorClass} border-b border-gray-200 py-3`}
                    >
                      <CardTitle className="flex items-center justify-between text-base">
                        <span>{config.label}</span>
                        <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                          {statusProjects.length}
                        </span>
                      </CardTitle>
                    </CardHeader>

                    <ProjectMiniTable
                      projects={statusProjects}
                      maxHeight={
                        status === 'IN_PRODUCTION'
                          ? 'max-h-[720px]'
                          : 'max-h-[360px]'
                      }
                      showFolder={status === 'IN_PRODUCTION'}
                      headerColorClass={colorClass}
                    />
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
