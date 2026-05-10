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

import { createNewClient } from '@/lib/data/clients';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string(),
  surname: z.string(),
  entreprise: z.string(),
  postalCode: z
    .preprocess(
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
      z.number({
        message: 'Le CodePostal doit être un nombre valide',
      }),
    )
    .optional(),
  address: z.string().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Le téléphone ne doit contenir que des chiffres')
    .regex(
      /^0\d{9}$/,
      'Le téléphone doit contenir 10 chiffres et commencer par 0',
    )
    .or(z.literal('')),
  mail: z.string().optional(),

  city: z.string().optional(),

  siret: z.string().optional(),
});

export function AddClientForm() {
  const router = useRouter();

  const form = useForm<z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      surname: '',
      entreprise: '',
      postalCode: 0,
      address: '',
      phone: '',
      mail: '',
      city: '',
      siret: '',
    },
  });

  async function onSubmit(data: z.output<typeof formSchema>) {
    await new Promise((res) => setTimeout(res, 300)); // fake API

    try {
      const newClient = await createNewClient({
        name: data.name,
        surname: data.surname,
        entreprise: data.entreprise,
        postalCode: data.postalCode,
        address: data.address,
        phone: data.phone,
        mail: data.mail,
        city: data.city,
        siret: data.siret,
      });
      form.reset();
      toast(
        <p className="text-xl font-semibold text-code-foreground text-center">
          Client ajouté
        </p>,
      );

      router.push(`/protected/clients/${newClient.id}`);
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <Card className="w-full sm:max-w-6xl">
      <CardHeader className="text-center">
        <CardTitle>Nouveau Client</CardTitle>
        <CardDescription>
          Entrez les informations relatives au nouveau client
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* NOM ET PRENOM */}
            <div className="flex justify-between items-center gap-8">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-name">Nom</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Albertini..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="surname"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-surname">
                      Prénom
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-surname"
                      aria-invalid={fieldState.invalid}
                      placeholder="Jean..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex justify-between items-center gap-8">
              {/* ENTREPRISE */}
              <Controller
                name="entreprise"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-entreprise">
                      Entreprise
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-entreprise"
                      aria-invalid={fieldState.invalid}
                      placeholder="Resturant du Cap..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="siret"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-siret">SIRET</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-siret"
                      aria-invalid={fieldState.invalid}
                      placeholder="A74FF"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {/* ADRESSE PAYS ET CODE POSTAL */}
            <div className="flex justify-between items-center gap-8">
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-address">
                      Adresse
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-address"
                      aria-invalid={fieldState.invalid}
                      placeholder="1 rue du Cap..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="postalCode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-postalCode">
                      CP
                    </FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      id="form-rhf-demo-postalCode"
                      aria-invalid={fieldState.invalid}
                      placeholder="20290"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-city">Ville</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-city"
                      aria-invalid={fieldState.invalid}
                      placeholder="Lucciana..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {/* COORDONNEES */}
            <div className="flex justify-between items-center gap-8">
              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-phone">
                      Téléphone
                    </FieldLabel>
                    <Input
                      type="number"
                      {...field}
                      id="form-rhf-demo-phone"
                      aria-invalid={fieldState.invalid}
                      placeholder="0400000000"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="mail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-mail">Email</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-mail"
                      aria-invalid={fieldState.invalid}
                      placeholder="contact@..."
                      autoComplete="off"
                    />
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
