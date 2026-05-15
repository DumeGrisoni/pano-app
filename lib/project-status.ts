export const PROJECT_STATUS = {
  PENDING_QUOTE: { label: 'En Attente de Devis', color: 'yellow' },
  QUOTED: { label: 'Devis Envoyé', color: 'green' },
  IN_DESIGN: { label: 'En Conception', color: 'indigo' },
  IN_COMMAND: { label: 'En Commande', color: 'violet' },
  IN_PRODUCTION: { label: 'En Production', color: 'orange' },
  TO_DELIVER: { label: 'À Livrer / Poser', color: 'amber' },
  DONE: { label: 'Terminé Non Réglé', color: 'cyan' },
  PAYED: { label: 'Payé', color: 'lime' },
  CANCELED: { label: 'Annulé', color: 'red' },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type StatusColor =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]['color'];

export const COLOR_MAP: Record<StatusColor, string> = {
  yellow: 'bg-yellow-500 text-white border-yellow-600',
  green: 'bg-green-500 text-white border-green-600',
  indigo: 'bg-indigo-500 text-white border-indigo-600',
  violet: 'bg-violet-500 text-white border-violet-600',
  orange: 'bg-orange-500 text-white border-orange-600',
  amber: 'bg-amber-500 text-white border-amber-600',
  cyan: 'bg-cyan-500 text-white border-cyan-600',
  lime: 'bg-lime-500 text-white border-lime-600',
  red: 'bg-red-500 text-white border-red-600',
};

export function getStatusColor(status: string) {
  const color = PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.color;

  return color ? COLOR_MAP[color] : '';
}

export function getStatusLabel(status: string) {
  return PROJECT_STATUS[status as keyof typeof PROJECT_STATUS]?.label ?? status;
}
