export const PROJECT_STATUS = {
  PENDING_QUOTE: { label: 'En attente de devis', color: 'yellow' },
  QUOTE_ACCEPTED: { label: 'Devis validé', color: 'emerald' },
  IN_DESIGN: { label: 'En conception', color: 'indigo' },
  DESIGN_ACCEPTED: { label: 'Conception validée', color: 'violet' },
  IN_PRODUCTION: { label: 'En production', color: 'orange' },
  TO_DELIVER: { label: 'À livrer', color: 'amber' },
  DONE: { label: 'Terminé', color: 'cyan' },
  PAYED: { label: 'Payé', color: 'lime' },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type StatusColor =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]['color'];

export const COLOR_MAP: Record<StatusColor, string> = {
  yellow: 'bg-yellow-500 text-white border-yellow-600',
  emerald: 'bg-emerald-500 text-white border-emerald-600',
  indigo: 'bg-indigo-500 text-white border-indigo-600',
  violet: 'bg-violet-500 text-white border-violet-600',
  orange: 'bg-orange-500 text-white border-orange-600',
  amber: 'bg-amber-500 text-white border-amber-600',
  cyan: 'bg-cyan-500 text-white border-cyan-600',
  lime: 'bg-lime-500 text-white border-lime-600',
};

export function getStatusColor(status: string) {
  const color = PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.color;

  return color ? COLOR_MAP[color] : '';
}

export function getStatusLabel(status: string) {
  return PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.label ?? status;
}
