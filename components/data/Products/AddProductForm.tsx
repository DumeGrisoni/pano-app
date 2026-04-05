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
import { Input } from '@/components/ui/input';

import { createProduct } from '@/lib/data/products';

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre doit avoir au moins 5 caractères.')
    .max(32, 'Le titre doit avoir au plus 32 caractères.'),
  ref: z
    .string()
    .min(1, 'La réference doit avoir au moins 4 caractères.')
    .max(100, 'La réference doit avoir au plus 100 caractères.'),
  supplier: z
    .string()
    .min(1, 'Le fournisseur doit avoir au moins 4 caractères.')
    .max(100, 'Le fournisseur doit avoir au plus 100 caractères.'),
  price: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        // Remplace virgule par point + trim
        const normalized = val.replace(',', '.').trim();

        const parsed = Number(normalized);

        // Si NaN → invalide
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
    await new Promise((res) => setTimeout(res, 300)); // fake API

    try {
      await createProduct({
        title: data.title,
        price: data.price,
        supplier: data.supplier,
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
                <span className="font-normal">{data.supplier}</span>
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
                  <Input {...field} placeholder="Ex: 3M" autoComplete="off" />
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
