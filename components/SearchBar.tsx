'use client';

import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

type SearchProps<T> = {
  data: T[];
  fields: (keyof T)[];
  placeholder?: string;
  children: (filteredData: T[]) => React.ReactNode;
};

export function SearchBar<T>({
  data,
  fields,
  placeholder = 'Rechercher...',
  children,
}: SearchProps<T>) {
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      fields.some((field) =>
        String(item[field] ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    );
  }, [data, search, fields]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {children(filteredData)}
    </div>
  );
}
