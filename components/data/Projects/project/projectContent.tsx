import { getClient } from '@/lib/data/clients';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';
import { getProject } from '@/lib/data/projects';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function ProjectContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await getProject(Number(id));

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>
            {project.entreprise} | {project.clientFullName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>
    </div>
  );
}
