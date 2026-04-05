'use client';
import { Database } from '@/database.types';
import {
  completeCommande,
  getCommandesWithItems,
  getCompletedCommandes,
} from '@/lib/data/commandes';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { changeDateFormat } from '@/lib/formatDate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CommandeWithItems =
  Database['public']['Tables']['Commandes']['Row'] & {
    supplier: {
      id: number;
      name: string;
    };
    Commande_items: Database['public']['Tables']['Commande_items']['Row'][];
  };

const PastCommandesList = () => {
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
  const [commandes, setCommandes] = useState<CommandeWithItems[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    today.getMonth(), // 0-11
  );

  const years = Array.from(
    new Set(
      commandes.map((c) => new Date(c.completed_at as string).getFullYear()),
    ),
  ).sort((a, b) => b - a); // tri desc

  const months = Array.from(
    new Set(
      commandes
        .filter(
          (c) =>
            new Date(c.completed_at as string).getFullYear() === selectedYear,
        )
        .map((c) => new Date(c.completed_at as string).getMonth()),
    ),
  ).sort((a, b) => b - a);

  const filteredCommandes = commandes.filter((c) => {
    const date = new Date(c.completed_at as string);

    return (
      date.getFullYear() === selectedYear && date.getMonth() === selectedMonth
    );
  });

  useEffect(() => {
    if (months.length === 0) return; // 🔥 IMPORTANT

    if (!months.includes(selectedMonth)) {
      setSelectedMonth(months[0]);
    }
  }, [selectedYear, months]);

  useEffect(() => {
    async function fetchCommandes() {
      const commandesData = await getCompletedCommandes();

      setCommandes(commandesData);
    }
    fetchCommandes();
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-[30vw]">
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

      {filteredCommandes.map((commande) => {
        const total = commande.Commande_items.reduce(
          (acc, item) => acc + (item.quantity ?? 0),
          0,
        );

        return (
          <Card key={commande.id} className="w-full">
            <CardHeader className="py-4 relative  rounded-t-md border-b ">
              <CardTitle className="flex justify-between items-center">
                <span className="text-xl flex-1 text-center">
                  {commande.supplier?.name}
                </span>
                <span className="absolute top-5 right-2 text-sm text-muted-foreground">
                  {total} produit{total > 1 && 's'}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex mt-3 flex-col w-full gap-2">
              {/* HEADER */}
              <ul className="space-y-2">
                <li className="grid grid-cols-3 font-semibold text-sm">
                  <span>Nom</span>
                  <span className="text-center">Référence</span>
                  <span className="text-right">Quantité</span>
                </li>
              </ul>
              <Separator />

              {/* ITEMS */}
              {commande.Commande_items.map((item) => (
                <ul key={item.id} className="space-y-2">
                  <li className="grid grid-cols-3 text-sm items-center">
                    <span>{item.productName}</span>

                    <span className="text-center">{item.productRef}</span>

                    <span className="text-right mr-[20%] font-medium">
                      x{item.quantity ?? 0}
                    </span>
                  </li>
                  <Separator />
                </ul>
              ))}
            </CardContent>

            <CardFooter className="flex justify-end ">
              <p>
                Commande passée le :{' '}
                <span className="font-semibold">
                  {changeDateFormat(commande.completed_at as string)}
                </span>
              </p>
            </CardFooter>
          </Card>
        );
      })}
      {commandes.length === 0 && <p>Aucune commande passée</p>}
    </div>
  );
};

export default PastCommandesList;
