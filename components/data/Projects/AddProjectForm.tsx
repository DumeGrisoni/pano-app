'use client';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect } from 'react';
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

import { createNewProject } from '@/lib/data/projects';
import { Switch } from '@/components/ui/switch';

import DatePicker from 'react-datepicker';

import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';

import { Database } from '@/database.types';
import { Textarea } from '@/components/ui/textarea';
registerLocale('fr', fr);

const formatDateData = (date: Date | null) => {
  if (!date) return null;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Le nom doit avoir au moins 1 caractères.')
    .max(32, 'Le nom doit avoir au plus 32 caractères.'),
  isUrgent: z.boolean().default(false),
  entreprise: z.string(),
  limitDate: z.date(),
  note: z.string(),
});

export function AddProjectForm({
  client,
}: {
  client: Database['public']['Tables']['Clients']['Insert'];
}) {
  const form = useForm<z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      entreprise: (client.entreprise && client.entreprise) || '',
      limitDate: new Date(),
      note: '',
      title: '',
      isUrgent: false,
    },
  });

  async function onSubmit(data: z.output<typeof formSchema>) {
    const diffDays = Math.ceil(
      (data.limitDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    let isUrgentData = false;
    if (data.isUrgent === false) {
      const isUrgents = diffDays <= 7;

      isUrgentData = isUrgents;
    } else {
      isUrgentData = data.isUrgent;
    }
    const formattedDate = formatDateData(data.limitDate);

    const entreprise = client.entreprise || '';

    const clientFullName = `${client.name} ${client.surname}`;

    const status = 'PENDING_QUOTE';
    await new Promise((res) => setTimeout(res, 300));

    try {
      await createNewProject({
        title: data.title,
        entreprise: entreprise,
        isUrgent: isUrgentData,
        clientFullName: clientFullName,
        limitDate: data.limitDate.toISOString().split('T')[0],
        status: status,
        clientId: client.id,
        note: data.note,
        tasks: [],
      });
      form.reset();
      toast(
        <p className="text-xl font-semibold text-code-foreground text-center">
          Projet Créé
        </p>,
      );
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <Card className="w-full sm:max-w-6xl">
      <CardHeader className="text-center">
        <CardTitle>Nouveau Projet</CardTitle>
        <CardDescription>
          Entrez les informations relatives au produit à ajouter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* NOM ET PRENOM */}
            <div className="flex justify-between items-center gap-8">
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
                      placeholder="Enseigne..."
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="isUrgent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-urgent">
                      Urgent
                    </FieldLabel>
                    <Switch
                      id="form-rhf-demo-urgent"
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        console.log(checked);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            {/* CLIENT */}
            <div className="flex justify-between items-center gap-8">
              <Controller
                name="limitDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-urgent">
                      Date Limite
                    </FieldLabel>
                    <DatePicker
                      className="bg-transparent cursor-pointer border border-gray-100/10 rounded-md p-1.5 text-sm"
                      selected={field.value ?? null}
                      locale={fr}
                      dateFormat="dd/MM/yyyy"
                      onChange={(date: Date | null) => {
                        field.onChange(date);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-note">Titre</FieldLabel>
                  <Textarea
                    {...field}
                    id="form-rhf-demo-note"
                    aria-invalid={fieldState.invalid}
                    placeholder="A faire..."
                    autoComplete="off"
                  />
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
