'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Trash } from 'lucide-react';

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
import { Separator } from '@/components/ui/separator';

import { createProduct, getProducts } from '@/lib/data/products';
import { Database } from '@/database.types';
import { getAllSuppliers } from '@/lib/data/suppliers';
import { SearchBar } from '@/components/SearchBar';

type PricingType = 'unit' | 'm2' | 'ml' | 'm3' | 'lot';

type BundleComponent = {
  productId: number;
  productName: string;

  productType?: string;
  type?: string;

  unitPrice?: number;
  pricing_type?: PricingType;
  unit_multiplier?: number;
};
const formSchema = z.object({
  title: z.string().min(1).max(100),
  ref: z.string().min(1).max(100),

  thickness: z.string().optional(),
  color: z.string().optional(),

  productType: z.enum(['media', 'support', 'goodie', 'other', 'bundle']),
  supplier: z.string().min(1, 'Sélectionner un fournisseur'),

  pricingType: z.enum(['unit', 'm2', 'ml', 'm3', 'lot']),
  unitMultiplier: z.preprocess((val) => Number(val), z.number().optional()),

  price: z.preprocess((val) => {
    if (typeof val === 'string') {
      const normalized = val.replace(',', '.').trim();
      const parsed = Number(normalized);
      if (isNaN(parsed)) return undefined;
      return parsed;
    }

    return val;
  }, z.number().gt(0)),
});

export function AddProductForm() {
  const [suppliers, setSuppliers] = React.useState<
    Database['public']['Tables']['Suppliers']['Row'][]
  >([]);

  const [products, setProducts] = React.useState<
    Database['public']['Tables']['Products']['Row'][]
  >([]);

  const [components, setComponents] = React.useState<BundleComponent[]>([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = React.useState<
    number | null
  >(null);

  React.useEffect(() => {
    async function fetchData() {
      const suppliersData = await getAllSuppliers();
      const productsData = await getProducts();

      setSuppliers(suppliersData);
      setProducts(productsData);
    }

    fetchData();
  }, []);

  const supplierMap = React.useMemo(() => {
    const map = new Map<number, string>();

    suppliers.forEach((supplier) => {
      map.set(supplier.id, supplier.name as string);
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
      productType: 'other',
      pricingType: 'unit',
      unitMultiplier: 1,
      thickness: '',
      color: '',
    },
  });

  const productType = form.watch('productType');
  const pricingType = form.watch('pricingType');

  function updateComponents(newComponents: BundleComponent[]) {
    setComponents(newComponents);
  }

  function validateBundle() {
    if (productType !== 'bundle') return true;

    if (components.length === 0) {
      toast.error('Ajoute au moins un composant au produit composé');
      return false;
    }

    for (const component of components) {
      if (!component.productId) {
        toast.error('Un composant n’a pas de produit sélectionné');
        return false;
      }
    }

    return true;
  }

  async function onSubmit(data: z.output<typeof formSchema>) {
    if (!validateBundle()) return;

    try {
      const supplierId = Number(data.supplier);

      const supplierName = supplierMap.get(Number(data.supplier)) || '';

      await createProduct({
        title: data.title,
        price: data.price,
        supplier: supplierId as number,
        supplierName,
        ref: data.ref,
        type: data.productType,

        color: data.productType === 'support' ? data.color || null : null,
        thickness:
          data.productType === 'support' ? data.thickness || null : null,
        components: data.productType === 'bundle' ? components : [],

        pricing_type: data.pricingType,
        unit_multiplier: data.unitMultiplier ?? 1,
      });

      form.reset({
        title: '',
        ref: '',
        supplier: '',
        price: 0,
        productType: 'other',
        pricingType: 'unit',
        unitMultiplier: 1,
        thickness: '',
        color: '',
      });

      setComponents([]);

      toast(
        <p className="text-xl font-semibold text-code-foreground text-center">
          Produit ajouté
        </p>,
      );
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  }

  return (
    <Card className="w-full max-w-[80vw]">
      <CardHeader>
        <CardTitle>Nouveau produit</CardTitle>
        <CardDescription>
          Entrez les informations relatives au produit à ajouter
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex gap-6 items-center justify-center">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Titre</FieldLabel>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      placeholder="Dibond + Vinyle Poly 3mm..."
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
                    <FieldLabel>Référence</FieldLabel>
                    <Input
                      {...field}
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
            </div>

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
              name="productType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Type de produit</FieldLabel>

                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);

                      if (value !== 'bundle') {
                        setComponents([]);
                      }
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="goodie">Goodie</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                      <SelectItem value="bundle">Produit composé</SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {productType === 'support' && (
              <div className="flex gap-6 items-center justify-center">
                <Controller
                  name="thickness"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Épaisseur</FieldLabel>
                      <Input
                        {...field}
                        placeholder="3mm, 5mm, 10mm..."
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="color"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Couleur</FieldLabel>
                      <Input
                        {...field}
                        placeholder="Blanc, Noir, Transparent..."
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            <div className="flex gap-6 items-center justify-center">
              <Controller
                name="price"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Prix final de vente</FieldLabel>
                    <Input {...field} placeholder="130" autoComplete="off" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="pricingType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Unité finale de vente</FieldLabel>

                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une unité" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="unit">Unité</SelectItem>
                        <SelectItem value="m2">m²</SelectItem>
                        <SelectItem value="ml">Mètre linéaire</SelectItem>
                        <SelectItem value="m3">m³</SelectItem>
                        <SelectItem value="lot">Lot</SelectItem>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {pricingType === 'lot' && (
                <Controller
                  name="unitMultiplier"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Quantité par lot</FieldLabel>
                      <Input {...field} placeholder="100" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
            </div>

            {productType === 'bundle' && (
              <div className="border rounded-md p-4 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Composants du produit</h3>
                    <p className="text-sm text-muted-foreground">
                      Ces composants servent à décomposer la production. Le prix
                      de vente reste celui du produit composé.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() =>
                      updateComponents([
                        ...components,
                        {
                          productId: 0,
                          productName: '',
                        },
                      ])
                    }
                  >
                    + Ajouter un composant
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-[minmax(300px,1fr)_60px] gap-4 text-xs font-semibold text-muted-foreground">
                  <div>Composant</div>
                  <div></div>
                </div>

                {components.map((component, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(300px,1fr)_60px] gap-4 items-center"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-auto min-h-10 justify-start whitespace-normal text-left"
                      onClick={() => {
                        setSelectedComponentIndex(index);
                        setOpenModal(true);
                      }}
                    >
                      <span className="block w-full break-words">
                        {component.productName || 'Choisir composant'}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        const copy = components.filter((_, i) => i !== index);
                        updateComponents(copy);
                      }}
                    >
                      <Trash />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            onClick={() => {
              form.reset({
                title: '',
                ref: '',
                supplier: '',
                price: 0,
                productType: 'other',
                pricingType: 'unit',
                unitMultiplier: 1,
                thickness: '',
                color: '',
              });
              setComponents([]);
            }}
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

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[90%] md:w-[45%] max-h-[75vh] flex flex-col">
            <CardHeader>
              <CardTitle>Choisir un composant</CardTitle>
              <CardDescription>
                Sélectionne un produit existant pour composer ce produit
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-auto">
              <SearchBar
                data={products.filter((product) => product.type !== 'bundle')}
                fields={['title', 'ref', 'supplierName']}
              >
                {(filtered) => (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="grid grid-cols-2 text-xs font-semibold text-muted-foreground px-2">
                      <div>Produit</div>
                      <div className="text-right">Type</div>
                    </div>

                    {filtered.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-2 min-h-16 items-center border p-2 rounded cursor-pointer hover:bg-muted"
                        onClick={() => {
                          if (selectedComponentIndex === null) return;

                          const copy = [...components];

                          copy[selectedComponentIndex] = {
                            ...copy[selectedComponentIndex],
                            productId: product.id,
                            productName: product.title as string,
                            productType: product.type as string,
                            type: product.type as string,

                            unitPrice: Number(product.price),
                            pricing_type:
                              (product.pricing_type as PricingType) ?? 'unit',
                            unit_multiplier: product.unit_multiplier ?? 1,
                          };

                          updateComponents(copy);
                          setOpenModal(false);
                          setSelectedComponentIndex(null);
                        }}
                      >
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.ref} • {product.supplierName}
                          </div>
                        </div>

                        <div className="text-sm font-semibold text-right">
                          {product.type}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SearchBar>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant="outline"
                type="button"
                onClick={() => {
                  setOpenModal(false);
                  setSelectedComponentIndex(null);
                }}
              >
                Fermer
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Card>
  );
}
