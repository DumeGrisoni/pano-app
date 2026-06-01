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

const DASHBOARD_ORDER: DashboardItem[] = [
  { type: 'status', key: 'PENDING_QUOTE' },
  { type: 'status', key: 'QUOTED' },
  { type: 'status', key: 'IN_DESIGN' },
  { type: 'status', key: 'IN_COMMAND' },

  { type: 'graphists-row', key: 'GRAPHISTS' },

  { type: 'status', key: 'IN_PRODUCTION' },
  { type: 'status', key: 'TO_DELIVER' },
  { type: 'status', key: 'DONE' },
];

function sortProjectsByTitle(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const titleA = String(a.title ?? '').toLowerCase();
    const titleB = String(b.title ?? '').toLowerCase();

    return titleA.localeCompare(titleB, 'fr');
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
}: {
  projects: Project[];
  maxHeight?: string;
  showStatus?: boolean;
  showFolder?: boolean;
}) {
  const colSpan = showFolder ? 5 : 4;

  return (
    <CardContent className="relative z-0 p-0">
      <div className={`relative z-0 ${maxHeight} overflow-y-auto`}>
        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="border-b">
              <TableHead className="w-[34%]">Projet</TableHead>
              <TableHead className="w-[28%]">Client</TableHead>

              {showStatus ? (
                <TableHead className="w-[24%]">Statut</TableHead>
              ) : (
                <TableHead className={showFolder ? 'w-[18%]' : 'w-[28%]'}>
                  Date limite
                </TableHead>
              )}

              {showFolder && <TableHead className="w-[12%]">Dossier</TableHead>}

              <TableHead className="w-[8%] text-center">Voir</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const statusConfig =
                  PROJECT_STATUS[project.status as ProjectStatus];

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium whitespace-normal break-words">
                      {project.title}
                    </TableCell>

                    <TableCell className="whitespace-normal break-words">
                      {project.entreprise || project.clientFullName}
                    </TableCell>

                    {showStatus ? (
                      <TableCell className="whitespace-normal break-words">
                        {statusConfig?.label ?? project.status ?? '—'}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell>
                          {project.limitDate
                            ? new Date(project.limitDate).toLocaleDateString(
                                'fr-FR',
                              )
                            : '—'}
                        </TableCell>

                        {showFolder && (
                          <TableCell className="font-medium">
                            {getProjectFolder(project)}
                          </TableCell>
                        )}
                      </>
                    )}

                    <TableCell className="text-center">
                      <Link
                        href={`/protected/projects/${project.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="icon" variant="ghost">
                          <Eye className="w-4 h-4" />
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
        acc[graphist.name] = sortProjectsByTitle(
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
      grouped[status as ProjectStatus] = sortProjectsByTitle(
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

      <div className="grid w-full grid-cols-1 xl:grid-cols-2 gap-6">
        {DASHBOARD_ORDER.map((item) => {
          if (item.type === 'graphists-row') {
            return (
              <div
                key="graphists-row"
                className="xl:col-span-2 grid w-full grid-cols-1 md:grid-cols-3 gap-4"
              >
                {GRAPHISTS.map((graphist) => {
                  const graphistProjects = projectsByGraphist[graphist.name];

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
                        maxHeight="max-h-[220px]"
                        showStatus={false}
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
              <CardHeader className={`${colorClass} border-b`}>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{config.label}</span>
                  <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold text-white">
                    {statusProjects.length}
                  </span>
                </CardTitle>
              </CardHeader>

              <ProjectMiniTable
                projects={statusProjects}
                maxHeight="max-h-[360px]"
                showFolder={status === 'IN_PRODUCTION'}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
