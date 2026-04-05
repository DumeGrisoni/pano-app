export const PROJECT_STATUS = {
  PENDING_QUOTE: { label: 'En attente de devis', color: 'yellow' },
  QUOTE_ACCEPTED: { label: 'Devis validé', color: 'emerald' },
  IN_DESIGN: { label: 'En conception', color: 'indigo' },
  DESIGN_ACCEPTED: { label: 'Conception validée', color: 'violet' },
  IN_PRODUCTION: { label: 'En production', color: 'orange' },
  TO_DELIVER: { label: 'À livrer', color: 'amber' },
  DONE: { label: 'Terminé', color: 'green' },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type StatusColor =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]['color'];

export const COLOR_MAP: Record<StatusColor, string> = {
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  violet: 'bg-violet-100 text-violet-800 border-violet-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  amber: 'bg-amber-100 text-amber-800 border-amber-300',
  green: 'bg-green-100 text-green-800 border-green-300',
};

export function getStatusColor(status: string) {
  const color = PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.color;

  return color ? COLOR_MAP[color] : '';
}

export function getStatusLabel(status: string) {
  return PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.label ?? status;
}
