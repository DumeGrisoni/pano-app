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

const DASHBOARD_ORDER = [
  { type: 'status', key: 'PENDING_QUOTE' },
  { type: 'status', key: 'QUOTED' },
  { type: 'status', key: 'IN_DESIGN' },
  { type: 'status', key: 'IN_COMMAND' },

  { type: 'graphist', key: 'Dumè' },
  { type: 'graphist', key: 'Manu' },
  { type: 'graphist', key: 'Matt' },

  { type: 'status', key: 'IN_PRODUCTION' },
  { type: 'status', key: 'TO_DELIVER' },
  { type: 'status', key: 'DONE' },
] as const;

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

function ProjectMiniTable({
  projects,
  maxHeight = 'max-h-[260px]',
  showStatus = false,
}: {
  projects: Project[];
  maxHeight?: string;
  showStatus?: boolean;
}) {
  return (
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-background border-b">
            <TableHead className="w-[35%]">Projet</TableHead>
            <TableHead className="w-[30%]">Client</TableHead>

            {showStatus && <TableHead className="w-[20%]">Statut</TableHead>}

            {!showStatus && (
              <TableHead className="w-[25%]">Date limite</TableHead>
            )}

            <TableHead className="w-[10%] text-center">Voir</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      <div className={`${maxHeight} overflow-y-auto`}>
        <Table>
          <TableBody>
            {projects.length > 0 ? (
              projects.map((project) => {
                const statusConfig =
                  PROJECT_STATUS[project.status as ProjectStatus];

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium max-w-[160px] whitespace-normal break-words">
                      {project.title}
                    </TableCell>

                    <TableCell className="max-w-[160px] whitespace-normal break-words">
                      {project.entreprise || project.clientFullName}
                    </TableCell>

                    {showStatus ? (
                      <TableCell>
                        {statusConfig?.label ?? project.status ?? '—'}
                      </TableCell>
                    ) : (
                      <TableCell>
                        {project.limitDate
                          ? new Date(project.limitDate).toLocaleDateString(
                              'fr-FR',
                            )
                          : '—'}
                      </TableCell>
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
                  colSpan={4}
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
            (project) => getProjectWho(project) === graphist.name,
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
    if (item.type === 'graphist') {
      const graphist = GRAPHISTS.find((g) => g.name === item.key);
      if (!graphist) return null;

      const graphistProjects = projectsByGraphist[graphist.name];

      return (
        <Card
          key={graphist.name}
          className="w-full overflow-hidden border shadow-sm"
        >
          <CardHeader className={`${graphist.colorClass} border-b py-3`}>
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
            showStatus
          />
        </Card>
      );
    }

    const status = item.key as ProjectStatus;
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
        />
      </Card>
    );
  })}
</div>
    </div>
  );
}