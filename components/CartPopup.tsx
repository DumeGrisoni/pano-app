'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CartItemRow } from './CartItemRow';
import { useCart } from '@/hooks/useCart';
import { Trash } from 'lucide-react';
import { validateCart } from '@/lib/data/commandes';

export default function CartPopover() {
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clearCart);

  const total = items.reduce((acc, item) => acc + item.quantity, 0);

  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.supplier_name]) {
        acc[item.supplier_name] = [];
      }
      acc[item.supplier_name].push(item);
      return acc;
    },
    {} as Record<string, typeof items>,
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          🛒
          {total > 0 && (
            <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-2">
              {total}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto">
        <div className="space-y-4">
          <h3 className="font-semibold">Panier</h3>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Panier vide</p>
          ) : (
            <>
              {Object.entries(groupedItems).map(([supplier, supplierItems]) => (
                <div key={supplier} className="space-y-2">
                  {/* 🧠 HEADER FOURNISSEUR */}
                  <div className="text-sm font-semibold border-b pb-1">
                    {supplier}
                  </div>

                  {/* 📦 ITEMS */}
                  {supplierItems.map((item) => (
                    <CartItemRow key={item.product_id} item={item} />
                  ))}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button
                  variant="destructive"
                  className=" mt-2"
                  onClick={clearCart}
                >
                  <Trash />
                </Button>
                <Button
                  className="mt-2"
                  onClick={async () => {
                    await validateCart(items);
                    clearCart();
                  }}
                >
                  Créer la commande
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
