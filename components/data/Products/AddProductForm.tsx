'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { createProduct } from '@/lib/data/products';
import { Database } from '@/database.types';
import { getAllSuppliers } from '@/lib/data/suppliers';

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre doit avoir au moins 5 caractères.')
    .max(32, 'Le titre doit avoir au plus 32 caractères.'),
  ref: z
    .string()
    .min(1, 'La réference doit avoir au moins 4 caractères.')
    .max(100, 'La réference doit avoir au plus 100 caractères.'),
  supplier: z.string().min(1, 'Le fournisseur est requis'), // 👈 ici c’est un ID (string)
  price: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const normalized = val.replace(',', '.').trim();
        const parsed = Number(normalized);
        if (isNaN(parsed)) return undefined;
        return parsed;
      }
      return val;
    },
    z
      .number({
        message: 'Le prix doit être un nombre valide',
      })
      .gt(0, 'Le prix doit être supérieur à 0'),
  ),
});

export function AddProductForm() {
  const [suppliers, setSuppliers] = React.useState<
    Database['public']['Tables']['Suppliers']['Row'][]
  >([]);

  React.useEffect(() => {
    async function fetchSuppliers() {
      const suppliers = await getAllSuppliers();
      setSuppliers(suppliers);
    }
    fetchSuppliers();
  }, []);

  // 🔥 Map optimisée pour récupérer le nom rapidement
  const supplierMap = React.useMemo(() => {
    const map = new Map<number, string>();
    suppliers.forEach((s) => {
      map.set(s.id, s.name as string);
    });
    return map;
  }, [suppliers]);

  const form = useForm<z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: '',
      ref: '',
      supplier: '',
      price: 0,
    },
  });

  async function onSubmit(data: z.output<typeof formSchema>) {
    await new Promise((res) => setTimeout(res, 300));

    try {
      const supplierId = Number(data.supplier);
      const supplierName = supplierMap.get(supplierId) || '';

      await createProduct({
        title: data.title,
        price: data.price,
        supplier: supplierId, // 👈 ID propre
        supplierName, // 👈 nom propre
        ref: data.ref,
      });

      form.reset();

      toast(
        <p className="text-xl font-semibold text-code-foreground ml-20 text-center">
          Produit ajouté
        </p>,
        {
          description: (
            <pre className="max-w-[500px] w-auto overflow-x-auto rounded-md p-4 text-code-foreground text-lg">
              <p className="font-semibold">
                Titre : <span className="font-normal">{data.title}</span>
              </p>
              <p className="font-semibold">
                Reference : <span className="font-normal">{data.ref}</span>
              </p>
              <p className="font-semibold">
                Fournisseur :{' '}
                <span className="font-normal">{supplierName}</span>
              </p>
              <p className="font-semibold">
                Prix : <span className="font-normal">{data.price} €</span>
              </p>
            </pre>
          ),
          position: 'top-center',
          classNames: {
            content: 'flex flex-col gap-2',
          },
          style: {
            '--border-radius': 'calc(var(--radius)  + 4px)',
          } as React.CSSProperties,
        },
      );
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Nouveau produit</CardTitle>
        <CardDescription>
          Entrez les informations relatives au produit à ajouter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">Titre</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Adhésif..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="ref"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-ref">Réference</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-ref"
                    aria-invalid={fieldState.invalid}
                    placeholder="A4B5C6"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="supplier"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fournisseur</FieldLabel>

                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un fournisseur" />
                    </SelectTrigger>

                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={String(supplier.id)}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Prix</FieldLabel>
                  <Input {...field} placeholder="10,5" autoComplete="off" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter>
        <Field
          orientation="horizontal"
          className="flex items-center justify-between w-full px-2"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Effacer
          </Button>

          <Button
            type="submit"
            form="form-rhf-demo"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
