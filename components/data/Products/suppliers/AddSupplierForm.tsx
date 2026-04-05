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

import { createSupplierSecure } from '@/lib/data/suppliers';
import { Eye, EyeClosed } from 'lucide-react';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom doit avoir au moins 5 caractères.')
    .max(32, 'Le nom doit avoir au plus 32 caractères.'),
  supplierEmail: z
    .string()
    .min(1, 'La mail doit avoir au moins 4 caractères.')
    .max(100, 'La mail doit avoir au plus 100 caractères.'),
  website: z
    .string()
    .min(1, 'Le site doit avoir au moins 4 caractères.')
    .max(100, 'Le site doit avoir au plus 100 caractères.'),
  connectEmail: z
    .string()
    .min(1, 'Le mail doit avoir au moins 4 caractères.')
    .max(100, 'Le mail doit avoir au plus 100 caractères.'),
  connectPassword: z
    .string()
    .min(1, 'Le mot de passe doit avoir au moins 4 caractères.')
    .max(100, 'Le mot de passe doit avoir au plus 100 caractères.'),
  phone: z.preprocess(
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
        message: 'Le numéro doit être un nombre valide',
      })
      .gt(0, 'Le numéro doit être supérieur à 0'),
  ),
});

export function AddSupplierForm() {
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      supplierEmail: '',
      phone: 0,
      website: '',
      connectEmail: '',
      connectPassword: '',
    },
  });

  async function onSubmit(data: z.output<typeof formSchema>) {
    await new Promise((res) => setTimeout(res, 300)); // fake API

    try {
      await createSupplierSecure(data);
      form.reset();
      toast(
        <p className="text-xl font-semibold text-code-foreground ml-20 text-center">
          Fournisseur ajouté
        </p>,
      );
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <Card className="w-full max-w-[90vw] ">
      <CardHeader>
        <CardTitle>Nouveau fournisseur</CardTitle>
        <CardDescription>
          Entrez les informations relatives au fournisseur à ajouter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className=" flex sm:flex-col md:flex-row gap-6 items-center justify-center">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-name">
                      Nom fournisseur
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Adhésif Pro..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Numéro</FieldLabel>
                    <Input
                      {...field}
                      placeholder="10,5"
                      autoComplete="off"
                      type="number"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="flex sm:flex-col md:flex-row gap-6 items-center justify-center">
              <Controller
                name="supplierEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-supplierEmail">
                      Email fournisseur
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-supplierEmail"
                      aria-invalid={fieldState.invalid}
                      placeholder="adhépro@...com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="website"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Site web</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Ex: adhepro.com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex sm:flex-col md:flex-row gap-6 items-center justify-center">
              <Controller
                name="connectEmail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-connectEmail">
                      Email connexion
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-connectEmail"
                      aria-invalid={fieldState.invalid}
                      placeholder="adhépro@...com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="connectPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Mot de passe</FieldLabel>

                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mot de passe"
                        autoComplete="off"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeClosed size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
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
