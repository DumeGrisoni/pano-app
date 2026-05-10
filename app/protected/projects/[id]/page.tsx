import ProjectContent from '@/components/data/Projects/project/projectContent';
import { Suspense } from 'react';

export default async function ProjectPage() {
  return (
    <div className="flex items-center justify-center w-[50vw] mx-auto">
      <Suspense fallback={<div>Chargement...</div>}>
        <ProjectContent />
      </Suspense>
    </div>
  );
}
