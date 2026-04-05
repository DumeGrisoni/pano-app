'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [search, setSearch] = useState('');

  const today = new Date();

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());

  const years = useMemo(() => {
    return Array.from(
      new Set(data.map((row: any) => new Date(row.limitDate).getFullYear())),
    ).sort((a, b) => b - a);
  }, [data]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        data
          .filter(
            (row: any) =>
              new Date(row.limitDate).getFullYear() === selectedYear,
          )
          .map((row: any) => new Date(row.limitDate).getMonth()),
      ),
    ).sort((a, b) => b - a);
  }, [data, selectedYear]);

  // 🔥 colonnes memo
  const memoColumns = useMemo(() => columns, [columns]);

  // 🔍 filtre + tri
  const filteredData = useMemo(() => {
    const searchLower = search.toLowerCase();

    return data
      .filter((row: any) => {
        // 🔥 filtre date
        const date = new Date(row.limitDate);

        const matchesDate =
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth;

        if (!matchesDate) return false;

        // 🔍 filtre texte
        const values = [row.title, row.clientFullName, row.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return values.includes(searchLower);
      })
      .sort((a: any, b: any) => {
        if (a.isUrgent !== b.isUrgent) {
          return Number(b.isUrgent) - Number(a.isUrgent);
        }

        const dateA = a.limitDate ? new Date(a.limitDate).getTime() : Infinity;
        const dateB = b.limitDate ? new Date(b.limitDate).getTime() : Infinity;

        return dateA - dateB;
      });
  }, [data, search, selectedYear, selectedMonth]);

  // 🔥 table
  const table = useReactTable({
    data: filteredData,
    columns: memoColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // 🔢 pagination intelligente
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const pages = Array.from({ length: pageCount }).filter(
    (_, i) => i >= pageIndex - 2 && i <= pageIndex + 2,
  );

  useEffect(() => {
    if (months.length === 0) return;

    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedMonth?.toString() ?? ''}
          onValueChange={(v) => setSelectedMonth(Number(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {monthNames[month]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* 🔍 Search */}
      <Input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* 📊 Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={memoColumns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔢 Pagination */}
      <div className="flex items-center justify-between">
        {/* Infos */}
        <div className="text-sm text-muted-foreground">
          {pageIndex + 1} / {pageCount}
        </div>

        {/* Controls */}
        <Pagination className="w-full flex-1">
          <PaginationContent className="flex flex-1 items-center w-full gap-8 justify-center">
            <PaginationItem>
              <PaginationLink
                onClick={() => table.previousPage()}
                className={
                  !table.getCanPreviousPage()
                    ? 'pointer-events-none opacity-50 w-full'
                    : 'cursor-pointer w-full px-2'
                }
              >
                Précédent
              </PaginationLink>
            </PaginationItem>

            {pages.map((_, i) => {
              const page = i + pageIndex - 2;

              if (page < 0 || page >= pageCount) return null;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={pageIndex === page}
                    onClick={() => table.setPageIndex(page)}
                    className="cursor-pointer w-full px-2"
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationLink
                onClick={() => table.nextPage()}
                className={
                  !table.getCanNextPage()
                    ? 'pointer-events-none opacity-50 w-full'
                    : 'cursor-pointer w-full px-2'
                }
              >
                Suivant
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        {/* Page size */}
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="border rounded-md px-2 py-1 text-sm"
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
