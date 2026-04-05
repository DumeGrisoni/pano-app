'use client';

import { getProject, updateProject } from '@/lib/data/projects';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Database } from '@/database.types';
import { usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { PROJECT_STATUS } from '@/lib/project-status';
import { getProducts } from '@/lib/data/products';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function ProjectContent() {
  const [project, setProject] = useState<
    Database['public']['Tables']['Projects']['Row']
  >({} as Database['public']['Tables']['Projects']['Row']);
  const [products, setProducts] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);

  const params = usePathname();

  const id = params.split('/').pop();

  // ✅ FIX JSONB
  async function saveItems(newItems: any[]) {
    const currentMetadata = (project.metadata ?? {}) as Record<string, any>;

    const newMetadata = {
      ...currentMetadata,
      items: newItems,
    };

    await updateProject(project.id, {
      metadata: newMetadata,
    });

    setProject((prev) => ({
      ...prev,
      metadata: newMetadata,
    }));
  }

  const updateItems = (newItems: any[]) => {
    setItems(newItems);
  };

  function getItemTotal(item: any) {
    const width = Number(item.width);
    const height = Number(item.height);
    const price = Number(item.unitPrice);
    const qty = Number(item.quantity);

    if (!width || !height || !price || !qty) return 0;

    const surface = (width / 1000) * (height / 1000);

    return surface * price * qty;
  }

  useEffect(() => {
    async function fetchProject() {
      const data = await getProject(Number(id));
      setProject(data);
    }
    fetchProject();
  }, []);

  useEffect(() => {
    const metadata = (project.metadata ?? {}) as any;
    setItems(metadata.items || []);
  }, [project]);
  useEffect(() => {
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* STATUS */}
      <div className="w-auto">
        <Select
          value={project.status || ''}
          onValueChange={async (value) => {
            // update local
            setProject((prev) => ({
              ...prev,
              status: value,
            }));

            // update DB
            await updateProject(project.id, {
              status: value,
            });
          }}
        >
          <SelectTrigger className="w-auto px-2">
            <SelectValue placeholder="Choisir un statut" />
          </SelectTrigger>

          <SelectContent side="bottom" align="start" position="popper">
            {Object.entries(PROJECT_STATUS).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      value.color === 'yellow'
                        ? 'bg-yellow-500'
                        : value.color === 'emerald'
                          ? 'bg-emerald-500'
                          : value.color === 'indigo'
                            ? 'bg-indigo-500'
                            : value.color === 'violet'
                              ? 'bg-violet-500'
                              : value.color === 'orange'
                                ? 'bg-orange-500'
                                : value.color === 'amber'
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                    }`}
                  />
                  <span>{value.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{project.title}</CardTitle>
          <CardDescription>
            {project.entreprise} | {project.clientFullName}
          </CardDescription>
        </CardHeader>

        {/* NOTE GÉNÉRALE */}

        <CardContent>
          <div className="flex mb-6 flex-col items-center justify-center gap-2 border rounded-md p-2 w-[50%] mx-auto shadow-md">
            <span className="font-semibold">Note Générale</span>
            <div className="w-[80%] mx-auto h-px bg-gray-200" />
            {project.note && <p>{project.note}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-center">
          <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
            <h3 className="font-semibold text-center">Produits du projet</h3>
            <Separator />

            {/* HEADER */}
            <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground">
              <div>Produit</div>
              <div>Qté</div>
              <div>Largeur (mm)</div>
              <div>Hauteur (mm)</div>
              <div>Total</div>
            </div>

            {/* LIGNES */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedIndex(index);
                    setOpenModal(true);
                  }}
                >
                  {item.productName || 'Choisir produit'}
                </Button>

                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].quantity = Number(e.target.value);
                    updateItems(copy);
                  }}
                />

                <input
                  type="number"
                  value={item.width}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].width = Number(e.target.value);
                    updateItems(copy);
                  }}
                />

                <input
                  type="number"
                  value={item.height}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[index].height = Number(e.target.value);
                    updateItems(copy);
                  }}
                />

                <div className="font-semibold">
                  {getItemTotal(item).toFixed(2)} €
                </div>
              </div>
            ))}

            <div className=" flex items-center justify-between">
              {/* ADD */}
              <Button
                onClick={() =>
                  updateItems([
                    ...items,
                    {
                      productId: 0,
                      productName: '',
                      quantity: 1,
                      width: 0,
                      height: 0,
                      unitPrice: 0,
                    },
                  ])
                }
              >
                + Ajouter un produit
              </Button>
              {/* TOTAL */}
              <div className="text-right font-semibold">
                Total :{' '}
                {items
                  .reduce((acc, item) => acc + getItemTotal(item), 0)
                  .toFixed(2)}{' '}
                €
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => saveItems(items)}>
                Enregistrer les produits
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[80%] md:w-auto max-h-[80vh] flex flex-col ">
            <CardHeader>
              <CardTitle>Choisir un produit</CardTitle>
              <CardDescription>
                Rechercher et sélectionner un produit
              </CardDescription>
            </CardHeader>

            <CardContent className="overflow-auto">
              <SearchBar
                data={products}
                fields={['title', 'ref', 'supplierName']}
              >
                {(filtered) => (
                  <div className="flex flex-col gap-2 mt-2">
                    {/* HEADER */}
                    <div className="grid grid-cols-3 text-xs font-semibold text-muted-foreground px-2">
                      <div>Produit</div>
                      <div>Réf / Fournisseur</div>
                      <div className="text-right">Prix</div>
                    </div>

                    {/* LISTE */}
                    {filtered.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-3 h-16 items-center border p-2 rounded cursor-pointer hover:bg-muted"
                        onClick={() => {
                          if (selectedIndex === null) return;

                          const copy = [...items];

                          copy[selectedIndex] = {
                            ...copy[selectedIndex],
                            productId: product.id,
                            productName: product.title,
                            unitPrice: Number(product.price),
                          };

                          updateItems(copy);
                          setOpenModal(false);
                        }}
                      >
                        {/* NOM */}
                        <div className="font-medium">{product.title}</div>

                        {/* REF + FOURNISSEUR */}
                        <div className="text-xs text-muted-foreground">
                          {product.ref} • {product.supplierName}
                        </div>

                        {/* PRIX */}
                        <div className="text-sm font-semibold text-right">
                          {product.price} €
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
                onClick={() => setOpenModal(false)}
              >
                Fermer
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
