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
import { use, useEffect, useState } from 'react';
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
import { Eye, Printer, Trash, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field';
import { ProjectPDF } from '@/lib/generatePDF';
import { getClient } from '@/lib/data/clients';

type pricing_type = 'unit' | 'm2' | 'ml' | 'm3' | 'lot';

type Item = {
  productId: number;
  productName: string;
  quantity: number;

  width?: number;
  height?: number;
  length?: number;
  depth?: number;

  unitPrice: number;

  pricing_type: pricing_type;
  unit_multiplier?: number;
};

type ProjectMetadata = {
  isProd?: boolean;
  isGraphisme?: boolean;
  isPose?: boolean;
  isProducts?: boolean;
  note?: string;
  prodNote?: string;
  graphismeNote?: string;
  poseNote?: string;
  items?: Item[];
};

export default function ProjectContent() {
  const [project, setProject] = useState<
    Database['public']['Tables']['Projects']['Row']
  >({} as Database['public']['Tables']['Projects']['Row']);
  const [products, setProducts] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [isProd, setIsProd] = useState(false);
  const [isGraphisme, setIsGraphisme] = useState(false);
  const [isPose, setIsPose] = useState(false);
  const [isProducts, setIsProducts] = useState(false);
  const [prodNote, setProdNote] = useState('');
  const [graphismeNote, setGraphismeNote] = useState('');
  const [poseNote, setPoseNote] = useState('');
  const [pdfType, setPdfType] = useState<
    'prod' | 'graphisme' | 'pose' | 'all' | ''
  >('');
  const [previewPDF, setPreviewPDF] = useState(false);
  const [client, setClient] = useState<
    Database['public']['Tables']['Clients']['Row']
  >({} as Database['public']['Tables']['Clients']['Row']);

  const params = usePathname();

  const id = params.split('/').pop();

  const computedMetadata: ProjectMetadata = {
    isProd,
    isGraphisme,
    isPose,
    isProducts,
    items,
    prodNote,
    graphismeNote,
    poseNote,
  };

  const saveAll = () => {
    const currentMetaData = (project.metadata ?? {}) as ProjectMetadata;

    const newMetaData = {
      ...currentMetaData,
      isProd,
      isGraphisme,
      isPose,
      isProducts,
      ...(isProducts && { items }),
      ...(isProd && { prodNote }),
      ...(isGraphisme && { graphismeNote }),
      ...(isPose && { poseNote }),
    };
    updateProject(project.id, {
      title: title,
      note: note,
      metadata: newMetaData,
    });
  };

  const updateItems = (newItems: any[]) => {
    setItems(newItems);
  };

  function getItemTotal(item: Item) {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);

    if (!qty || !price) return 0;

    switch (item.pricing_type) {
      case 'unit':
        return price * qty;

      case 'ml': {
        const length = (Number(item.length ?? item.width) || 0) / 1000;
        return length * price * qty;
      }

      case 'm2': {
        const width = (Number(item.width) || 0) / 1000;
        const height = (Number(item.height) || 0) / 1000;
        return width * height * price * qty;
      }

      case 'm3': {
        const width = (Number(item.width) || 0) / 1000;
        const height = (Number(item.height) || 0) / 1000;
        const depth = (Number(item.depth) || 0) / 1000;
        return width * height * depth * price * qty;
      }

      case 'lot': {
        const divider = item.unit_multiplier || 1;
        return (qty / divider) * price;
      }

      default:
        return 0;
    }
  }

  const handlePrint = () => {
    const content = document.getElementById('pdf-preview');
    if (!content) {
      console.log('preview non monté');
      return;
    }

    const win = window.open('', '_blank');
    if (!win) return;

    // 🔥 copie les styles existants
    const styles = Array.from(document.styleSheets)
      .map((styleSheet: any) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule: any) => rule.cssText)
            .join('');
        } catch {
          return '';
        }
      })
      .join('');

    win.document.write(`
    <html>

      <head>
        <title>Print</title>
        <style>${styles}</style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
    </html>
  `);

    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.print();
        win.close();
      }, 200);
    };
  };

  const metadata = (project.metadata ?? {}) as ProjectMetadata;

  useEffect(() => {
    async function fetchProject() {
      const data = await getProject(Number(id));
      setProject(data);
    }
    fetchProject();
  }, []);

  useEffect(() => {
    if (project.note) setNote(project.note);
    if (project.title) setTitle(project.title);
    if (metadata.isProd) setIsProd(metadata.isProd);
    if (metadata.isGraphisme) setIsGraphisme(metadata.isGraphisme);
    if (metadata.isPose) setIsPose(metadata.isPose);
    if (metadata.isProducts) setIsProducts(metadata.isProducts);
    if (metadata.prodNote) setProdNote(metadata.prodNote);
    if (metadata.graphismeNote) setGraphismeNote(metadata.graphismeNote);
    if (metadata.poseNote) setPoseNote(metadata.poseNote);
  }, [project]);

  useEffect(() => {
    const metadata = (project.metadata ?? {}) as ProjectMetadata;
    setItems(metadata.items || []);
  }, [project]);

  useEffect(() => {
    if (!project) return;
    async function fetchProducts() {
      const data = await getProducts();
      setProducts(data);
      const Clientdata = await getClient(
        project.clientId?.toString() as string,
      );
      setClient(Clientdata);
    }
    fetchProducts();
  }, [project]);

  const hasAnyPDF = isProd || isGraphisme || isPose;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* STATUS */}
      <div className="flex items-center justify-between">
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
        <div className="flex items-center justify-center gap-4">
          <Select value={pdfType} onValueChange={(v: any) => setPdfType(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir PDF" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="prod" disabled={!isProd}>
                Production
              </SelectItem>

              <SelectItem value="graphisme" disabled={!isGraphisme}>
                Graphisme
              </SelectItem>

              <SelectItem value="pose" disabled={!isPose}>
                Pose
              </SelectItem>

              <SelectItem value="all" disabled={!hasAnyPDF}>
                Actifs
              </SelectItem>
            </SelectContent>
          </Select>
          {pdfType && (
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setPreviewPDF(true)}>
                <Eye />
              </Button>
              <Button
                onClick={() => {
                  setPreviewPDF(true);

                  setTimeout(() => {
                    handlePrint();
                  }, 100);
                }}
              >
                <Printer />
              </Button>
            </div>
          )}
        </div>
      </div>
      <Card>
        <CardHeader className="text-center">
          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            className="w-auto mx-auto text-center font-semibold text-3xl"
          />

          <CardDescription>
            {project.entreprise} | {project.clientFullName}
          </CardDescription>
        </CardHeader>

        {/* NOTE GÉNÉRALE */}

        <CardContent>
          <div className="flex mb-2 flex-col items-center justify-center gap-2 border rounded-md p-2 w-[80%] mx-auto shadow-md">
            <span className="font-semibold">Note Générale</span>

            <Textarea
              className="w-full"
              placeholder="Note Générale"
              rows={5}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex gap-2 items-center justify-center mb-4">
              <FieldLabel htmlFor="produit" className="font-semibold text-lg">
                Fournitures
              </FieldLabel>
              <Checkbox
                id="product"
                name="product"
                onCheckedChange={() => {
                  setIsProducts(!isProducts);
                }}
                checked={isProducts}
              />
            </div>
            <div className="flex gap-2 items-center justify-center mb-4">
              <FieldLabel htmlFor="graphisme" className="font-semibold text-lg">
                Visuel
              </FieldLabel>
              <Checkbox
                id="graphisme"
                name="graphisme"
                onCheckedChange={() => {
                  setIsGraphisme(!isGraphisme);
                }}
                checked={isGraphisme}
              />
            </div>
            <div className="flex gap-2 items-center justify-center mb-4">
              <FieldLabel htmlFor="prod" className="font-semibold text-lg">
                Production
              </FieldLabel>
              <Checkbox
                id="prod"
                name="prod"
                onCheckedChange={() => {
                  setIsProd(!isProd);
                }}
                checked={isProd}
              />
            </div>

            <div className="flex gap-2 items-center justify-center mb-4">
              <FieldLabel htmlFor="graphisme" className="font-semibold text-lg">
                Pose
              </FieldLabel>
              <Checkbox
                id="pose"
                name="pose"
                onCheckedChange={() => {
                  setIsPose(!isPose);
                }}
                checked={isPose}
              />
            </div>
          </div>
          {isProducts && (
            <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">
                Fournitures du projet
              </h3>
              <Separator />

              {/* HEADER */}
              <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-muted-foreground">
                <div>Produit</div>
                <div>Qté</div>
                <div>Largeur (mm)</div>
                <div>Hauteur (mm)</div>
                <div>Total</div>
                <div>Supprimer</div>
              </div>

              {/* LIGNES */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 items-center"
                >
                  <Button
                    className="truncate max-w-[150px]"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedIndex(index);
                      setOpenModal(true);
                    }}
                  >
                    <span className="truncate w-full text-left">
                      {item.productName || 'Choisir produit'}
                    </span>
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
                    placeholder={
                      item.pricing_type === 'ml' ? 'Longueur (mm)' : 'Largeur'
                    }
                    value={item.width}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[index].width = Number(e.target.value);

                      // 🔥 ML → on copie dans length
                      if (item.pricing_type === 'ml') {
                        copy[index].length = Number(e.target.value);
                      }

                      updateItems(copy);
                    }}
                  />

                  <input
                    type="number"
                    placeholder={item.pricing_type === 'ml' ? '—' : 'Hauteur'}
                    value={item.pricing_type === 'ml' ? '' : item.height}
                    disabled={item.pricing_type === 'ml'}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[index].height = Number(e.target.value);
                      updateItems(copy);
                    }}
                  />

                  <div className="font-semibold">
                    {getItemTotal(item).toFixed(2)} €
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const copy = items.filter((_, i) => i !== index);
                      updateItems(copy);
                    }}
                  >
                    <Trash />
                  </Button>
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

                        pricing_type: 'unit',
                        unit_multiplier: 1,
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
            </div>
          )}

          {isGraphisme && (
            <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">Visuel à réaliser</h3>
              <Separator />

              <Textarea
                value={graphismeNote}
                onChange={(e) => setGraphismeNote(e.target.value)}
                rows={5}
              />
            </div>
          )}

          {isProd && (
            <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">
                Productions à réaliser
              </h3>
              <Separator />

              {/* HEADER */}
              <div className="text-center">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground mb-4">
                  <div>Produit</div>
                  <div>Qté</div>
                  <div>Largeur (mm)</div>
                  <div>Hauteur (mm)</div>
                </div>

                {/* LIGNES */}
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-4 items-center text-center"
                  >
                    <div className="">{item.productName}</div>
                    <div>{item.quantity}</div>
                    <div className="">{item.width}</div>
                    <div className="">{item.height}</div>
                  </div>
                ))}
                <Card className="w-[80%] md:w-auto max-h-[80vh] flex flex-col mt-4">
                  <CardHeader>
                    <CardTitle>Notes de production</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={prodNote}
                      onChange={(e) => setProdNote(e.target.value)}
                      rows={5}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isPose && (
            <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">Pose à réaliser</h3>
              <Separator />

              <Textarea
                value={poseNote}
                onChange={(e) => setPoseNote(e.target.value)}
                rows={5}
              />
            </div>
          )}
          <div className="flex items-center justify-center w-full">
            <Button onClick={saveAll} className="w-[50%] ">
              Enregistrer
            </Button>
          </div>
        </CardFooter>
      </Card>
      {previewPDF && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex justify-center items-start overflow-auto p-10"
          onClick={() => setPreviewPDF(false)}
        >
          <div
            className="flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              id="pdf-preview"
              className="bg-zinc-300 min-h-screen flex flex-col items-center gap-10 p-10"
            >
              <ProjectPDF
                client={client}
                metadata={computedMetadata}
                project={project}
                type={pdfType || 'all'}
              />
            </div>
          </div>
        </div>
      )}

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

                            pricing_type: product.pricing_type || 'unit',
                            unit_multiplier: product.unit_multiplier ?? 1,
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
