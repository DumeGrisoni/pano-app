import { PROJECT_STATUS, ProjectStatus } from '@/lib/project-status';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const current = PROJECT_STATUS[status];
  const COLOR_MAP = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${COLOR_MAP[current.color]}`}
    >
      {current.label}
    </span>
  );
}
