export const formatDateData = (date: Date | null) => {
  if (!date) return null;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

//Mettre date yyyy/mm/dd en dd/MM/YYYY
export const changeDateFormat = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};
