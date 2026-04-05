import ProjectContent from '@/components/data/Projects/project/projectContent';
import { Suspense } from 'react';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex items-center justify-center w-[50vw]">
      <Suspense fallback={<div>Chargement...</div>}>
        <ProjectContent params={params} />
      </Suspense>
    </div>
  );
}
