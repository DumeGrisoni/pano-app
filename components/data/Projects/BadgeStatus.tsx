import { PROJECT_STATUS, COLOR_MAP, ProjectStatus } from '@/lib/project-status';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const current = PROJECT_STATUS[status];

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${COLOR_MAP[current.color]}`}
    >
      {current.label}
    </span>
  );
}
