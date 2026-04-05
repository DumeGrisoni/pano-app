'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

type Props = {
  item: {
    product_id: number;
    product_name: string;
    supplier_name: string;
    quantity: number;
  };
};

export function CartItemRow({ item }: Props) {
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);

  return (
    <div className="flex justify-between items-center border-b pb-2 gap-6">
      <div>
        <p className="text-sm font-medium">{item.product_name}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
        >
          -
        </Button>

        <span className="text-sm w-6 text-center">{item.quantity}</span>

        <Button
          size="icon"
          variant="outline"
          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
        >
          +
        </Button>

        <Button
          size="icon"
          variant="destructive"
          onClick={() => removeItem(item.product_id)}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
