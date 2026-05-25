'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import DatePicker, { registerLocale } from 'react-datepicker';
import { fr } from 'date-fns/locale/fr';
import { Eye, Printer, Trash } from 'lucide-react';

import { getProject, updateProject } from '@/lib/data/projects';
import { getProducts } from '@/lib/data/products';
import { getClient } from '@/lib/data/clients';
import { Database } from '@/database.types';
import { PROJECT_STATUS } from '@/lib/project-status';
import { ProjectPDF } from '@/lib/generatePDF';

import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

registerLocale('fr', fr);

type PricingType = 'unit' | 'm2' | 'ml' | 'm3' | 'lot';

type GoodieOptions = {
  option1?: string;
  option2?: string;
  placement?: string;
};

type BacheFinition =
  | 'brut'
  | 'oeillets_500'
  | 'oeillets_1000'
  | 'oeillets_coins';

type BacheOptions = {
  finition?: BacheFinition;
};

type BundleComponent = {
  productId: number;
  productName: string;
  productType?: string;
  type?: string;
  unitPrice?: number;
  pricing_type?: PricingType;
  unit_multiplier?: number;
};

type Item = {
  productId: number;
  productName: string;
  productType?: string;
  type?: string;

  cutOptions?: {
    color?: string;
    ral?: string;
  };

  tintedFilmOptions?: {
    pose?: 'inter' | 'exter';
    ref?: string;
  };

  manualTotal?: number | null;
  components?: BundleComponent[] | BundleComponent | string;

  isCustom?: boolean;
  customName?: string;
  customPrice?: number;

  quantity: number;

  width?: number;
  height?: number;
  length?: number;
  depth?: number;

  option1?: string;
  option2?: string;

  diffusant?: boolean | null;

  plastifEnabled?: boolean;
  plastifProductId?: number;
  plastifProductName?: string;

  unitPrice: number;

  pricing_type: PricingType;
  unit_multiplier?: number;

  goodieOptions?: GoodieOptions;
  bacheOptions?: BacheOptions;
};

type ProjectMetadata = {
  isFile?: boolean;
  isBAT?: boolean;

  isPose?: boolean;
  poseDate?: string;
  isNacelle?: boolean;
  poseAdresse?: string;

  items?: Item[];
};

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function normalizeType(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}
const WHO_OPTIONS = ['Dumè', 'Manu', 'Matt'] as const;

type WhoOption = (typeof WHO_OPTIONS)[number];

function normalizeComponents(raw: unknown): BundleComponent[] {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === 'object') {
      return [parsed as BundleComponent];
    }

    return [];
  } catch {
    return [];
  }
}

function titleNeedsBacheFinishing(title: unknown) {
  const text = normalizeText(title);

  return (
    text.includes('bache') || text.includes('meche') || text.includes('toile')
  );
}

function titleNeedsPlastif(title: unknown) {
  const text = normalizeText(title);

  return text.includes('vinyle') || text.includes('vinyl');
}

export default function ProjectContent() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  const [project, setProject] = useState<
    Database['public']['Tables']['Projects']['Row']
  >({} as Database['public']['Tables']['Projects']['Row']);

  const [client, setClient] = useState<
    Database['public']['Tables']['Clients']['Row']
  >({} as Database['public']['Tables']['Clients']['Row']);

  const [products, setProducts] = useState<
    Database['public']['Tables']['Products']['Row'][]
  >([]);

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [limitDate, setLimitDate] = useState<Date | null>(new Date());
  const [isUrgent, setIsUrgent] = useState(false);

  const [isFile, setIsFile] = useState(false);
  const [isBAT, setIsBAT] = useState(false);

  const [isPose, setIsPose] = useState(false);
  const [poseDate, setPoseDate] = useState<Date | null>(new Date());
  const [isNacelle, setIsNacelle] = useState(false);
  const [poseAdresse, setPoseAdresse] = useState('');

  const [items, setItems] = useState<Item[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [previewPDF, setPreviewPDF] = useState(false);

  

  const plastifProducts = useMemo(() => {
    return products.filter((product) =>
      normalizeText(product.title).includes('plastif'),
    );
  }, [products]);

  const computedMetadata: ProjectMetadata = {
    isFile,
    isBAT,
    isPose,
    poseDate: poseDate?.toISOString(),
    isNacelle,
    poseAdresse,
    items,
  };
async function handleWhoChange(value: WhoOption) {
  if (!project.id) return;

  const now = new Date().toISOString();
  const currentWhen = (project as any).when;

  const payload = {
    Who: value,
    when: currentWhen || now,
    updateWhen: now,
  };

  setProject((prev) => ({
    ...prev,
    ...payload,
  }));

  try {
    await updateProject(project.id, payload as any);
    toast.success('Responsable mis à jour');
  } catch {
    toast.error('Erreur pendant la mise à jour du responsable');
  }
}
  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      const projectData = await getProject(Number(id));
      const productsData = await getProducts();

      setProject(projectData);
      setProducts(productsData);

      const metadata = (projectData.metadata ?? {}) as ProjectMetadata;

      setTitle(projectData.title ?? '');
      setNote(projectData.note ?? '');
      setIsUrgent(projectData.isUrgent ?? false);
      setLimitDate(
        projectData.limitDate ? new Date(projectData.limitDate) : new Date(),
      );

      setIsFile(metadata.isFile ?? false);
      setIsBAT(metadata.isBAT ?? false);

      setIsPose(metadata.isPose ?? false);
      setPoseDate(metadata.poseDate ? new Date(metadata.poseDate) : new Date());
      setIsNacelle(metadata.isNacelle ?? false);
      setPoseAdresse(metadata.poseAdresse ?? '');

      setItems(metadata.items ?? []);

      if (projectData.clientId) {
        const clientData = await getClient(projectData.clientId.toString());
        setClient(clientData);
      }
    }

    fetchData();
  }, [id]);

  function updateItems(newItems: Item[]) {
    setItems(newItems);
  }

  function getProductById(productId?: number) {
    return products.find((product) => Number(product.id) === Number(productId));
  }

  function getComponentType(component: BundleComponent) {
    const directType = normalizeType(component.productType ?? component.type);

    if (directType) return directType;

    const linkedProduct = getProductById(component.productId);

    return normalizeType((linkedProduct as any)?.type);
  }

  function getComponentName(component: BundleComponent) {
    if (component.productName) return component.productName;

    const linkedProduct = getProductById(component.productId);

    return String(linkedProduct?.title ?? '');
  }

  function itemComponents(item: Item) {
    return normalizeComponents(item.components);
  }

  function itemType(item: Item) {
    return normalizeType(item.productType ?? item.type);
  }

  function itemIsBundle(item: Item) {
    return itemType(item) === 'bundle' || itemComponents(item).length > 0;
  }

  function itemHasComponentType(item: Item, type: string) {
    return itemComponents(item).some(
      (component) => getComponentType(component) === type,
    );
  }

  function itemHasGoodie(item: Item) {
    return itemType(item) === 'goodie' || itemHasComponentType(item, 'goodie');
  }

  function itemHasSupport(item: Item) {
    return (
      itemType(item) === 'support' || itemHasComponentType(item, 'support')
    );
  }

  function itemHasMedia(item: Item) {
    return itemType(item) === 'media' || itemHasComponentType(item, 'media');
  }

  function itemHasOtherOnly(item: Item) {
    return (
      item.isCustom || itemType(item) === 'other' || itemType(item) === 'autre'
    );
  }

  function itemNeedsDimensions(item: Item) {
    if (itemHasSupport(item)) return true;

    return false;
  }

  function itemNeedsGoodieOptions(item: Item) {
    if (itemHasOtherOnly(item)) return false;

    return itemHasGoodie(item) && !itemNeedsDimensions(item);
  }

  function itemNeedsBundleGoodiePlacement(item: Item) {
    if (itemHasOtherOnly(item)) return false;

    return itemIsBundle(item) && itemHasGoodie(item);
  }

  function itemNeedsDiffusant(item: Item) {
    return itemIsBundle(item) && itemHasSupport(item);
  }

  function itemNeedsBacheFinishing(item: Item) {
    if (!itemHasMedia(item) && !itemHasSupport(item)) return false;

    if (titleNeedsBacheFinishing(item.productName)) return true;

    return itemComponents(item).some((component) =>
      titleNeedsBacheFinishing(getComponentName(component)),
    );
  }

  function itemNeedsPlastif(item: Item) {
    if (!itemHasMedia(item)) return false;

    if (titleNeedsPlastif(item.productName)) return true;

    return itemComponents(item).some((component) => {
      const componentType = getComponentType(component);
      const componentName = getComponentName(component);

      return componentType === 'media' && titleNeedsPlastif(componentName);
    });
  }

  function itemNeedsCutOptions(item: Item) {
    if (itemHasGoodie(item)) return false;

    const texts = [
      item.productName,
      ...itemComponents(item).map((component) => getComponentName(component)),
    ];

    return texts.some((title) => {
      const text = normalizeText(title);

      return (
        text.includes('decoupe adhesive') ||
        text.includes('decoupe adhesif') ||
        text.includes('adhesif decoupe') ||
        text.includes('adhesive decoupe')
      );
    });
  }

  function itemNeedsTintedFilmOptions(item: Item) {
    const texts = [
      item.productName,
      ...itemComponents(item).map((component) => getComponentName(component)),
    ];

    return texts.some((title) => {
      const text = normalizeText(title);

      return (
        text.includes('film teinte') ||
        text.includes('film teintee') ||
        text.includes('teinte')
      );
    });
  }

  function productHasType(
    product: Database['public']['Tables']['Products']['Row'],
    type: string,
  ) {
    const productType = normalizeType((product as any).type);

    if (productType === type) return true;

    const components = normalizeComponents((product as any).components);

    return components.some((component) => getComponentType(component) === type);
  }

  function productNeedsBacheFinishing(
    product: Database['public']['Tables']['Products']['Row'],
  ) {
    if (
      !productHasType(product, 'media') &&
      !productHasType(product, 'support')
    ) {
      return false;
    }

    if (titleNeedsBacheFinishing(product.title)) return true;

    const components = normalizeComponents((product as any).components);

    return components.some((component) =>
      titleNeedsBacheFinishing(getComponentName(component)),
    );
  }

  function productNeedsPlastif(
    product: Database['public']['Tables']['Products']['Row'],
  ) {
    if (!productHasType(product, 'media')) return false;

    if (titleNeedsPlastif(product.title)) return true;

    const components = normalizeComponents((product as any).components);

    return components.some((component) => {
      const componentType = getComponentType(component);
      const componentName = getComponentName(component);

      return componentType === 'media' && titleNeedsPlastif(componentName);
    });
  }

  function setBacheFinition(index: number, finition: BacheFinition) {
    const copy = [...items];

    copy[index].bacheOptions = {
      ...copy[index].bacheOptions,
      finition,
    };

    updateItems(copy);
  }

  function setDiffusant(index: number, value: boolean) {
    const copy = [...items];

    copy[index].diffusant = value;

    updateItems(copy);
  }

  function getCalculatedItemTotal(item: Item) {
    const qty = Number(item.quantity);

    const price = item.isCustom
      ? Number(item.customPrice)
      : Number(item.unitPrice);

    if (!qty || !price) return 0;

    const shouldUseSimpleQtyPrice =
      itemHasGoodie(item) || itemHasOtherOnly(item);

    if (shouldUseSimpleQtyPrice) {
      return price * qty;
    }

    switch (item.pricing_type) {
      case 'unit':
        return price * qty;

      case 'ml': {
        const width = (Number(item.width) || 0) / 1000;
        const height = (Number(item.height) || 0) / 1000;

        if (height > 0) {
          return width * height * price * qty;
        }

        return width * price * qty;
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

  function getItemTotal(item: Item) {
    if (item.manualTotal !== null && item.manualTotal !== undefined) {
      return Number(item.manualTotal);
    }

    return getCalculatedItemTotal(item);
  }

  function validateProjectDetails() {
    if (items.length === 0) {
      toast.error('Ajoute au moins un produit');
      return false;
    }

    for (const item of items) {
      const name = item.isCustom ? item.customName : item.productName;

      if (!name?.trim()) {
        toast.error('Un produit n’a pas de nom');
        return false;
      }

      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Quantité invalide pour ${name}`);
        return false;
      }

      if (
        item.isCustom &&
        (item.manualTotal === null ||
          item.manualTotal === undefined ||
          item.manualTotal <= 0)
      ) {
        toast.error(`Prix invalide pour ${name}`);
        return false;
      }

      if (!item.isCustom && !item.productId) {
        toast.error(`Produit non sélectionné : ${name}`);
        return false;
      }

      if (itemNeedsTintedFilmOptions(item)) {
        if (!item.tintedFilmOptions?.pose) {
          toast.error(`Choisis pose inter ou pose exter pour ${name}`);
          return false;
        }

        if (!item.tintedFilmOptions?.ref?.trim()) {
          toast.error(`Référence film obligatoire pour ${name}`);
          return false;
        }
      }

      if (itemNeedsCutOptions(item)) {
        const hasColor = item.cutOptions?.color?.trim();
        const hasRal = item.cutOptions?.ral?.trim();

        if (!hasColor && !hasRal) {
          toast.error(`Couleur ou RAL obligatoire pour ${name}`);
          return false;
        }
      }

      if (itemNeedsDimensions(item)) {
        if (item.pricing_type === 'm2' && (!item.width || !item.height)) {
          toast.error(`Largeur et hauteur obligatoires pour ${name}`);
          return false;
        }

        if (item.pricing_type === 'ml' && !item.length && !item.width) {
          toast.error(`Longueur obligatoire pour ${name}`);
          return false;
        }

        if (
          item.pricing_type === 'm3' &&
          (!item.width || !item.height || !item.depth)
        ) {
          toast.error(
            `Largeur, hauteur et profondeur obligatoires pour ${name}`,
          );
          return false;
        }
      }

      if (itemNeedsGoodieOptions(item)) {
        if (!item.option1?.trim() && !item.goodieOptions?.option1?.trim()) {
          toast.error(`Option 1 obligatoire pour ${name}`);
          return false;
        }

        if (!item.option2?.trim() && !item.goodieOptions?.option2?.trim()) {
          toast.error(`Option 2 obligatoire pour ${name}`);
          return false;
        }
      }

      if (itemNeedsBundleGoodiePlacement(item)) {
        if (!item.goodieOptions?.placement?.trim()) {
          toast.error(`Position du marquage obligatoire pour ${name}`);
          return false;
        }
      }

      if (itemNeedsDiffusant(item) && item.diffusant === null) {
        toast.error(`Choisis si "${name}" est diffusant ou non`);
        return false;
      }

      if (itemNeedsBacheFinishing(item) && !item.bacheOptions?.finition) {
        toast.error(`Choisis une finition pour ${name}`);
        return false;
      }

      if (
        itemNeedsPlastif(item) &&
        item.plastifEnabled &&
        !item.plastifProductId
      ) {
        toast.error(`Choisis un plastif pour ${name}`);
        return false;
      }
    }

    if (isPose) {
      if (!poseDate) {
        toast.error('Choisis une date de pose');
        return false;
      }

      if (!poseAdresse.trim()) {
        toast.error('Renseigne une adresse de pose');
        return false;
      }
    }

    return true;
  }

  async function saveAll() {
    if (!project.id) return;
    if (!validateProjectDetails()) return;

    try {
      await updateProject(project.id, {
        title,
        note,
        isUrgent,
        limitDate: limitDate
          ? limitDate.toISOString().split('T')[0]
          : project.limitDate,
        metadata: computedMetadata,
      });

      setProject((prev) => ({
        ...prev,
        title,
        note,
        isUrgent,
        limitDate: limitDate
          ? limitDate.toISOString().split('T')[0]
          : prev.limitDate,
        metadata: computedMetadata,
      }));

      toast.success('Projet enregistré');
    } catch {
      toast.error('Erreur pendant l’enregistrement');
    }
  }

  function handlePrint() {
    const content = document.getElementById('pdf-preview');
    if (!content) return;

    const win = window.open('', '_blank');
    if (!win) return;

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
        <body>${content.innerHTML}</body>
      </html>
    `);

    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.print();
        win.close();
      }, 200);
    };
  }

  return (
    <div className="w-full flex flex-col gap-6 ">
      <div className="flex items-center justify-between">
        <Select
          value={project.status || ''}
          onValueChange={async (value) => {
            setProject((prev) => ({
              ...prev,
              status: value,
            }));

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
                      value.color === 'green'
                        ? 'bg-green-500'
                        : value.color === 'yellow'
                          ? 'bg-yellow-500'
                          : value.color === 'indigo'
                            ? 'bg-indigo-500'
                            : value.color === 'violet'
                              ? 'bg-violet-500'
                              : value.color === 'orange'
                                ? 'bg-orange-500'
                                : value.color === 'amber'
                                  ? 'bg-amber-500'
                                  : value.color === 'cyan'
                                    ? 'bg-cyan-500'
                                    : value.color === 'lime'
                                      ? 'bg-lime-500'
                                      : 'bg-gray-500'
                    }`}
                  />
                  <span>{value.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
{/* Graphistes  */}
        <Select
  value={(project as any).Who || ''}
  onValueChange={(value) => handleWhoChange(value as WhoOption)}
>
  <SelectTrigger className="w-auto min-w-32 px-2">
    <SelectValue placeholder="Qui ?" />
  </SelectTrigger>

  <SelectContent side="bottom" align="start" position="popper">
    {WHO_OPTIONS.map((name) => (
      <SelectItem key={name} value={name}>
        {name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

        <div className="flex gap-3">
          <Button type="button" onClick={() => setPreviewPDF(true)}>
            <Eye />
          </Button>

          <Button
            type="button"
            onClick={() => {
              setPreviewPDF(true);
              setTimeout(() => handlePrint(), 100);
            }}
          >
            <Printer />
          </Button>
        </div>
      </div>

      <Card className="w-full max-w-[80%] md:max-w-[99%] mx-auto">
        <CardHeader className="text-center flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <CardTitle>Modifier Projet</CardTitle>
            <CardDescription>
              {project.entreprise} | {project.clientFullName}
            </CardDescription>
          </div>

          <div className="flex flex-row items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium">Fichier Fourni</label>
              <Switch checked={isFile} onCheckedChange={setIsFile} />
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium">BAT Validé</label>
              <Switch checked={isBAT} onCheckedChange={setIsBAT} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Field className="mb-6">
            <FieldLabel>Titre</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enseigne..."
              autoComplete="off"
            />
          </Field>

          <div className="flex justify-between items-center gap-8 mb-6">
            <Field>
              <FieldLabel>Date Limite</FieldLabel>
              <DatePicker
                className="bg-transparent cursor-pointer border border-gray-800/10 rounded-md p-1.5 text-sm"
                selected={limitDate}
                locale={fr}
                dateFormat="dd/MM/yyyy"
                onChange={(date: Date | null) => setLimitDate(date)}
              />
            </Field>

            <Field>
              <FieldLabel>Priorité</FieldLabel>
              <Switch checked={isUrgent} onCheckedChange={setIsUrgent} />
            </Field>
          </div>

          <div className="flex flex-col gap-6">
            <div className="mb-6 border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">
                Fournitures du projet
              </h3>

              <Separator />

              <div className="grid grid-cols-[minmax(300px,1fr)_50px_120px_120px_100px_60px] gap-4 text-xs font-semibold text-muted-foreground items-center">
                <div>Produit</div>
                <div>Qté</div>
                <div>Option 1 / Largeur</div>
                <div>Option 2 / Hauteur</div>
                <div>Total</div>
                <div></div>
              </div>

              {items.map((item, index) => {
                const needsDimensions =
                  itemNeedsDimensions(item) ||
                  item.pricing_type === 'm2' ||
                  item.pricing_type === 'ml' ||
                  item.pricing_type === 'm3';

                const needsGoodieOptions = itemNeedsGoodieOptions(item);
                const needsBundleGoodiePlacement =
                  itemNeedsBundleGoodiePlacement(item);
                const needsDiffusant = itemNeedsDiffusant(item);
                const needsBacheFinishing = itemNeedsBacheFinishing(item);
                const needsPlastif = itemNeedsPlastif(item);
                const needsOtherOptions =
                  !needsDimensions && !needsGoodieOptions;

                return (
                  <div key={index} className="flex flex-col gap-6">
                    <div className="grid grid-cols-[minmax(300px,1fr)_50px_120px_120px_100px_60px] gap-4 items-center">
                      <Button
                        className="w-full h-auto min-h-10 justify-start whitespace-normal text-left"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (item.isCustom) return;
                          setSelectedIndex(index);
                          setOpenModal(true);
                        }}
                      >
                        <span className="block w-full break-words">
                          {item.isCustom
                            ? item.customName || 'Autre produit'
                            : item.productName || 'Choisir produit'}
                        </span>
                      </Button>

                      <input
                        className="w-12 h-10 text-center rounded-md border px-1"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[index].quantity = Number(e.target.value);
                          updateItems(copy);
                        }}
                      />

                      {needsDimensions ? (
                        <>
                          <Input
                            type="number"
                            placeholder="Largeur"
                            value={item.width}
                            onChange={(e) => {
                              const copy = [...items];
                              copy[index].width = Number(e.target.value);
                              updateItems(copy);
                            }}
                          />

                          <Input
                            type="number"
                            placeholder="Hauteur"
                            value={item.height}
                            onChange={(e) => {
                              const copy = [...items];
                              copy[index].height = Number(e.target.value);
                              updateItems(copy);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <Input
                            placeholder={
                              needsGoodieOptions
                                ? 'Couleur / finition'
                                : 'Option 1'
                            }
                            value={
                              needsGoodieOptions
                                ? (item.goodieOptions?.option1 ?? '')
                                : (item.option1 ?? '')
                            }
                            onChange={(e) => {
                              const copy = [...items];

                              if (needsGoodieOptions) {
                                copy[index].goodieOptions = {
                                  ...copy[index].goodieOptions,
                                  option1: e.target.value,
                                };
                              } else {
                                copy[index].option1 = e.target.value;
                              }

                              updateItems(copy);
                            }}
                          />

                          <Input
                            placeholder={
                              needsGoodieOptions ? 'Taille / autre' : 'Option 2'
                            }
                            value={
                              needsGoodieOptions
                                ? (item.goodieOptions?.option2 ?? '')
                                : (item.option2 ?? '')
                            }
                            onChange={(e) => {
                              const copy = [...items];

                              if (needsGoodieOptions) {
                                copy[index].goodieOptions = {
                                  ...copy[index].goodieOptions,
                                  option2: e.target.value,
                                };
                              } else {
                                copy[index].option2 = e.target.value;
                              }

                              updateItems(copy);
                            }}
                          />
                        </>
                      )}

                      <div className="flex flex-col gap-1">
                        <Input
                          type="number"
                          step="0.01"
                          className="w-28"
                          value={
                            item.manualTotal !== null &&
                            item.manualTotal !== undefined
                              ? item.manualTotal
                              : Number(getCalculatedItemTotal(item).toFixed(2))
                          }
                          onChange={(e) => {
                            const copy = [...items];

                            copy[index].manualTotal =
                              e.target.value === ''
                                ? null
                                : Number(e.target.value);

                            updateItems(copy);
                          }}
                        />
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

                    {itemNeedsTintedFilmOptions(item) && (
                      <div className="border rounded-md p-3 bg-muted/20 flex flex-col gap-3">
                        <div className="text-sm font-medium">
                          Options film teinté
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              item.tintedFilmOptions?.pose === 'inter'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => {
                              const copy = [...items];

                              copy[index].tintedFilmOptions = {
                                ...copy[index].tintedFilmOptions,
                                pose: 'inter',
                              };

                              updateItems(copy);
                            }}
                          >
                            Pose Intérieur
                          </Button>

                          <Button
                            type="button"
                            variant={
                              item.tintedFilmOptions?.pose === 'exter'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => {
                              const copy = [...items];

                              copy[index].tintedFilmOptions = {
                                ...copy[index].tintedFilmOptions,
                                pose: 'exter',
                              };

                              updateItems(copy);
                            }}
                          >
                            Pose Extérieur
                          </Button>
                        </div>

                        <Input
                          placeholder="Référence film"
                          value={item.tintedFilmOptions?.ref ?? ''}
                          onChange={(e) => {
                            const copy = [...items];

                            copy[index].tintedFilmOptions = {
                              ...copy[index].tintedFilmOptions,
                              ref: e.target.value,
                            };

                            updateItems(copy);
                          }}
                        />
                      </div>
                    )}

                    {needsBundleGoodiePlacement && (
                      <div className="border rounded-md p-3 bg-muted/20 flex flex-col gap-3">
                        <div className="text-sm font-medium">
                          Options goodie
                        </div>

                        <Input
                          placeholder="Positionnement du marquage"
                          value={item.goodieOptions?.placement ?? ''}
                          onChange={(e) => {
                            const copy = [...items];

                            copy[index].goodieOptions = {
                              ...copy[index].goodieOptions,
                              placement: e.target.value,
                            };

                            updateItems(copy);
                          }}
                        />
                      </div>
                    )}

                    {needsDiffusant && (
                      <div className="border rounded-md p-3 bg-muted/20 flex flex-col gap-3">
                        <div className="text-sm font-medium">
                          Diffusant obligatoire
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              item.diffusant === true ? 'default' : 'outline'
                            }
                            onClick={() => setDiffusant(index, true)}
                          >
                            Oui
                          </Button>

                          <Button
                            type="button"
                            variant={
                              item.diffusant === false ? 'default' : 'outline'
                            }
                            onClick={() => setDiffusant(index, false)}
                          >
                            Non
                          </Button>
                        </div>
                      </div>
                    )}

                    {needsBacheFinishing && (
                      <div className="border rounded-md p-3 bg-muted/20 flex flex-col gap-3">
                        <div className="text-sm font-medium">
                          Finition obligatoire
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant={
                              item.bacheOptions?.finition === 'brut'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => setBacheFinition(index, 'brut')}
                          >
                            Brut
                          </Button>

                          <Button
                            type="button"
                            variant={
                              item.bacheOptions?.finition === 'oeillets_500'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setBacheFinition(index, 'oeillets_500')
                            }
                          >
                            Œillets 500mm
                          </Button>

                          <Button
                            type="button"
                            variant={
                              item.bacheOptions?.finition === 'oeillets_1000'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setBacheFinition(index, 'oeillets_1000')
                            }
                          >
                            Œillets 1000mm
                          </Button>

                          <Button
                            type="button"
                            variant={
                              item.bacheOptions?.finition === 'oeillets_coins'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setBacheFinition(index, 'oeillets_coins')
                            }
                          >
                            Œillets coins
                          </Button>
                        </div>
                      </div>
                    )}

                    {itemNeedsCutOptions(item) && (
                      <div className="grid grid-cols-2 gap-4 border rounded-md p-3 bg-muted/20">
                        <Input
                          placeholder="Couleur"
                          value={item.cutOptions?.color ?? ''}
                          onChange={(e) => {
                            const copy = [...items];

                            copy[index].cutOptions = {
                              ...copy[index].cutOptions,
                              color: e.target.value,
                            };

                            updateItems(copy);
                          }}
                        />

                        <Input
                          placeholder="RAL"
                          value={item.cutOptions?.ral ?? ''}
                          onChange={(e) => {
                            const copy = [...items];

                            copy[index].cutOptions = {
                              ...copy[index].cutOptions,
                              ral: e.target.value,
                            };

                            updateItems(copy);
                          }}
                        />
                      </div>
                    )}

                    {needsPlastif && (
                      <div className="border rounded-md p-3 bg-muted/20 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <FieldLabel>Plastif ?</FieldLabel>

                          <Switch
                            checked={item.plastifEnabled ?? false}
                            onCheckedChange={(checked) => {
                              const copy = [...items];

                              copy[index].plastifEnabled = checked;

                              if (!checked) {
                                copy[index].plastifProductId = undefined;
                                copy[index].plastifProductName = undefined;
                              }

                              updateItems(copy);
                            }}
                          />
                        </div>

                        {item.plastifEnabled && (
                          <Select
                            value={
                              item.plastifProductId
                                ? String(item.plastifProductId)
                                : ''
                            }
                            onValueChange={(value) => {
                              const plastif = plastifProducts.find(
                                (product) => String(product.id) === value,
                              );

                              const copy = [...items];

                              copy[index].plastifProductId = Number(value);
                              copy[index].plastifProductName =
                                plastif?.title as string;

                              updateItems(copy);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir un plastif" />
                            </SelectTrigger>

                            <SelectContent>
                              {plastifProducts.map((product) => (
                                <SelectItem
                                  key={product.id}
                                  value={String(product.id)}
                                >
                                  {product.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}

                    {item.isCustom && (
                      <div className="grid grid-cols-2 gap-4 border rounded-md p-3">
                        <Input
                          placeholder="Nom du produit"
                          value={item.customName ?? ''}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[index].customName = e.target.value;
                            updateItems(copy);
                          }}
                        />

                        <Input
                          type="number"
                          placeholder="Prix"
                          value={item.customPrice ?? 0}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[index].customPrice = Number(e.target.value);
                            updateItems(copy);
                          }}
                        />
                      </div>
                    )}

                    <Separator className="mt-2" />
                  </div>
                );
              })}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      updateItems([
                        ...items,
                        {
                          productId: 0,
                          productName: '',
                          manualTotal: null,
                          productType: '',
                          type: '',
                          components: [],
                          quantity: 1,
                          width: 0,
                          height: 0,
                          unitPrice: 0,
                          pricing_type: 'unit',
                          unit_multiplier: 1,
                          diffusant: null,
                          goodieOptions: undefined,
                          bacheOptions: undefined,
                        },
                      ])
                    }
                  >
                    + Ajouter un produit
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      updateItems([
                        ...items,
                        {
                          productId: 0,
                          productName: 'Autre',
                          productType: 'other',
                          type: 'other',
                          components: [],
                          isCustom: true,
                          customName: '',
                          customPrice: 0,
                          quantity: 1,
                          manualTotal: null,
                          width: 0,
                          height: 0,
                          unitPrice: 0,
                          pricing_type: 'unit',
                          unit_multiplier: 1,
                          option1: '',
                          option2: '',
                          diffusant: null,
                          goodieOptions: undefined,
                          bacheOptions: undefined,
                        },
                      ])
                    }
                  >
                    + Autre
                  </Button>
                </div>

                <div className="text-right font-semibold">
                  Total :{' '}
                  {items
                    .reduce((acc, item) => acc + getItemTotal(item), 0)
                    .toFixed(2)}{' '}
                  €
                </div>
              </div>
            </div>

            <Field>
              <FieldLabel>Descriptif</FieldLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A faire..."
                rows={4}
              />
            </Field>

            <div className="border rounded-md p-4 w-full shadow-sm flex flex-col gap-6">
              <h3 className="font-semibold text-center">Pose</h3>

              <Separator />

              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <FieldLabel>Pose</FieldLabel>
                  <Switch checked={isPose} onCheckedChange={setIsPose} />
                </div>

                {isPose && (
                  <>
                    <div className="flex items-center gap-2">
                      <FieldLabel>Date</FieldLabel>
                      <DatePicker
                        className="bg-transparent cursor-pointer border border-gray-800/10 rounded-md p-1.5 text-sm"
                        selected={poseDate}
                        locale={fr}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date: Date | null) => setPoseDate(date)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <FieldLabel>Nacelle</FieldLabel>
                      <Switch
                        checked={isNacelle}
                        onCheckedChange={setIsNacelle}
                      />
                    </div>
                  </>
                )}
              </div>

              {isPose && (
                <Field>
                  <FieldLabel>Adresse de pose</FieldLabel>
                  <Input
                    value={poseAdresse}
                    onChange={(e) => setPoseAdresse(e.target.value)}
                    placeholder="Adresse..."
                  />
                </Field>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Field
            orientation="horizontal"
            className="flex items-center justify-between w-full px-2"
          >
            <Button type="button" variant="outline">
              Annuler
            </Button>

            <Button type="button" onClick={saveAll}>
              Enregistrer
            </Button>
          </Field>
        </CardFooter>

        {openModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center w-full z-50">
            <Card className="w-[90%] md:w-[40%] max-h-[70vh] flex flex-col">
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
                      <div className="grid grid-cols-2 text-xs font-semibold text-muted-foreground px-2">
                        <div>Produit</div>
                        <div className="text-right">Prix</div>
                      </div>

                      {filtered.map((product) => {
                        const productType = normalizeType(
                          (product as any).type,
                        );
                        const productComponents = normalizeComponents(
                          (product as any).components,
                        );

                        const productHasSupport = productHasType(
                          product,
                          'support',
                        );
                        const productHasMedia = productHasType(
                          product,
                          'media',
                        );
                        const productHasGoodie = productHasType(
                          product,
                          'goodie',
                        );

                        const needsDimensions =
                          productType === 'bundle' &&
                          productHasGoodie &&
                          !productHasSupport
                            ? false
                            : productHasSupport ||
                              productHasMedia ||
                              product.pricing_type === 'm2' ||
                              product.pricing_type === 'ml' ||
                              product.pricing_type === 'm3';

                        const needsBache = productNeedsBacheFinishing(product);
                        const needsPlastif = productNeedsPlastif(product);
                        const needsDiffusant =
                          productType === 'bundle' && productHasSupport;

                        return (
                          <div
                            key={product.id}
                            className="grid grid-cols-2 min-h-16 items-center border p-2 rounded cursor-pointer hover:bg-muted"
                            onClick={() => {
                              if (selectedIndex === null) return;

                              const copy = [...items];

                              copy[selectedIndex] = {
                                ...copy[selectedIndex],

                                productId: product.id,
                                productName: product.title as string,

                                productType,
                                type: productType,

                                components: productComponents,
                                manualTotal: null,
                                isCustom: false,
                                customName: '',
                                customPrice: 0,

                                unitPrice: Number(product.price),

                                pricing_type:
                                  ((product as any)
                                    .pricing_type as PricingType) ?? 'unit',

                                unit_multiplier:
                                  ((product as any)
                                    .unit_multiplier as number) ?? 1,

                                width: 0,
                                height: 0,
                                length: 0,
                                depth: 0,

                                option1:
                                  !needsDimensions && !productHasGoodie
                                    ? ''
                                    : undefined,
                                option2:
                                  !needsDimensions && !productHasGoodie
                                    ? ''
                                    : undefined,

                                diffusant: needsDiffusant ? null : undefined,

                                plastifEnabled: needsPlastif
                                  ? false
                                  : undefined,
                                plastifProductId: undefined,
                                plastifProductName: undefined,

                                goodieOptions: productHasGoodie
                                  ? {
                                      option1: '',
                                      option2: '',
                                      placement:
                                        productType === 'bundle'
                                          ? ''
                                          : undefined,
                                    }
                                  : undefined,

                                bacheOptions: needsBache
                                  ? {
                                      finition: undefined,
                                    }
                                  : undefined,
                              };

                              updateItems(copy);
                              setOpenModal(false);
                            }}
                          >
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {productType}
                                {productHasSupport ? ' • support' : ''}
                                {productHasMedia ? ' • media' : ''}
                                {productHasGoodie ? ' • goodie' : ''}
                                {needsBache ? ' • finition' : ''}
                                {needsPlastif ? ' • plastif' : ''}
                              </div>
                            </div>

                            <div className="text-sm font-semibold text-right">
                              {product.price} €
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SearchBar>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant="outline"
                  type="button"
                  onClick={() => setOpenModal(false)}
                >
                  Fermer
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
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
              className="bg-white w-[210mm] min-h-[297mm] p-[10mm]"
            >
              <ProjectPDF
                client={client}
                metadata={computedMetadata}
                project={{
                  ...project,
                  title,
                  note,
                  isUrgent,
                  limitDate: limitDate
                    ? limitDate.toISOString().split('T')[0]
                    : project.limitDate,
                }}
                type="all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
