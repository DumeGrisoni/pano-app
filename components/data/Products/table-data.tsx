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

import { useDeferredValue, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [search, setSearch] = useState('');

  // 🔥 évite de bloquer le UI pendant la frappe
  const deferredSearch = useDeferredValue(search);

  // 🔥 stabilise les colonnes (CRUCIAL)
  const memoColumns = useMemo(() => columns, [columns]);

  // 🔍 filtre optimisé
  const filteredData = useMemo(() => {
    const searchLower = deferredSearch.toLowerCase();

    return data
      .filter((row: any) =>
        `${row.title ?? ''} ${row.ref ?? ''} ${row.supplierName ?? ''}`
          .toLowerCase()
          .includes(searchLower),
      )
      .sort((a: any, b: any) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();

        return titleA.localeCompare(titleB, 'fr');
      });
  }, [data, deferredSearch]);
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

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 🔍 SearchBar */}
      <Input
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm mx-auto"
      />

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
