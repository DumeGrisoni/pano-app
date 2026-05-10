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

export default function Home() {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    async function fetchProjects() {
      const data = await getAllProjects();
      setProjects(data);
    }

    fetchProjects();
  }, []);

  const projectsByStatus = React.useMemo(() => {
    const grouped = {} as Record<ProjectStatus, Project[]>;

    Object.keys(PROJECT_STATUS).forEach((status) => {
      grouped[status as ProjectStatus] = [];
    });

    projects
      .filter((project) => project.status !== 'PAYED')
      .forEach((project) => {
        const status = project.status as ProjectStatus;

        if (grouped[status]) {
          grouped[status].push(project);
        }
      });

    Object.keys(grouped).forEach((status) => {
      grouped[status as ProjectStatus].sort((a, b) => {
        const titleA = String(a.title ?? '').toLowerCase();
        const titleB = String(b.title ?? '').toLowerCase();

        return titleA.localeCompare(titleB, 'fr');
      });
    });

    return grouped;
  }, [projects]);

  return (
    <div className="min-h-screen w-full flex flex-col gap-8 p-6">
      <h1 className="text-2xl font-bold text-center tracking-wide">
        PROJETS EN COURS
      </h1>

      <div className="grid w-full grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(PROJECT_STATUS)
          .filter(([status]) => status !== 'PAYED')
          .map(([status, config]) => {
            const statusProjects = projectsByStatus[status as ProjectStatus];
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

                <CardContent className="p-0">
                  {/* HEADER FIXE */}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-background border-b">
                        <TableHead className="w-[35%]">Projet</TableHead>
                        <TableHead className="w-[35%]">Client</TableHead>
                        <TableHead className="w-[20%]">Date limite</TableHead>
                        <TableHead className="w-[10%] text-center">
                          Voir
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>

                  {/* BODY SCROLLABLE */}
                  <div className="max-h-[420px] overflow-y-auto">
                    <Table>
                      <TableBody>
                        {statusProjects.length > 0 ? (
                          statusProjects.map((project) => (
                            <TableRow key={project.id}>
                              <TableCell className="font-medium">
                                {project.title}
                              </TableCell>

                              <TableCell className="">
                                {project.entreprise || project.clientFullName}
                              </TableCell>

                              <TableCell>
                                {project.limitDate
                                  ? new Date(
                                      project.limitDate,
                                    ).toLocaleDateString('fr-FR')
                                  : '—'}
                              </TableCell>

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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="h-20 text-center text-muted-foreground"
                            >
                              Aucun projet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
