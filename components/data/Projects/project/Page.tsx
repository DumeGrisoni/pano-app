export function PagePDF({ children }: { children: React.ReactNode }) {
  return (
    <div className="page w-[794px] h-[1123px] bg-white flex flex-col px-4 py-4 page-break">
      {children}
    </div>
  );
}
