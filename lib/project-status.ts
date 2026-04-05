export const PROJECT_STATUS = {
  PENDING_QUOTE: { label: 'En attente de devis', color: 'yellow' },
  QUOTE_ACCEPTED: { label: 'Devis validé', color: 'blue' },
  IN_PRODUCTION: { label: 'En production', color: 'orange' },
  TO_DELIVER: { label: 'À livrer', color: 'orange' },
  DONE: { label: 'Terminé', color: 'green' },
} as const;

export type ProjectStatus = keyof typeof PROJECT_STATUS;
