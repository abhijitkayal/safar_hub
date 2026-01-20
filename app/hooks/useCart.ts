// app/hooks/useCart.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CartItem = {
  _id: string;
  itemId: string;
  itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental";
  quantity: number;
  variantId?: string | null;
  variant?: {
    _id: string;
    color: string;
    size: string;
    stock: number;
    price?: number;
    photos?: string[];
  } | null;
  item: any;
};

type UseCartOptions = {
  autoLoad?: boolean;
};

export function useCart({ autoLoad = false }: UseCartOptions = {}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (res.status === 401) {
        setItems([]);
        setError("You need to log in to use cart.");
        return;
      }
      if (!res.ok) {
        throw new Error((await res.json())?.message || "Failed to load cart");
      }
      const data = await res.json();
      setItems(Array.isArray(data?.cart) ? data.cart : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load cart");
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  }, []);

  const addToCart = useCallback(
    async (
      itemId: string,
      itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental",
      quantity: number = 1,
      variantId?: string
    ) => {
      setError(null);
      try {
        // Validate inputs before sending request
        if (!itemId || !itemType) {
          throw new Error("itemId and itemType are required");
        }

        if (quantity < 1) {
          throw new Error("Quantity must be at least 1");
        }

        const payload: Record<string, any> = { itemId, itemType, quantity };
        if (variantId) {
          payload.variantId = variantId;
        }

        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          throw new Error("Please log in to add to cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to add to cart");
        }
        await refresh();
      } catch (err: any) {
        console.error("Add to cart error:", err);
        setError(err?.message || "Failed to add to cart");
        throw err;
      }
    },
    [refresh]
  );

  const removeFromCart = useCallback(
    async (cartItemIdOrInfo: string, itemType?: string, variantId?: string) => {
      setError(null);
      let cartItemId = cartItemIdOrInfo;

      if (itemType) {
        const found = items.find(
          (i) =>
            i.itemId === cartItemIdOrInfo &&
            i.itemType === itemType &&
            (variantId ? i.variantId === variantId : true)
        );
        if (!found) {
          throw new Error("Item not found in cart");
        }
        cartItemId = found._id;
      }

      try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) {
          throw new Error("Please log in to manage cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to remove from cart");
        }
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Failed to remove from cart");
        throw err;
      }
    },
    [refresh, items]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      setError(null);
      if (quantity < 1) {
        await removeFromCart(cartItemId);
        return;
      }
      try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity }),
        });
        if (res.status === 401) {
          throw new Error("Please log in to manage cart.");
        }
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.message || "Failed to update cart");
        }
        await refresh();
      } catch (err: any) {
        setError(err?.message || "Failed to update cart");
        throw err;
      }
    },
    [refresh, removeFromCart]
  );

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.variant?.price ?? item.item?.price ?? item.item?.basePrice ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const isInCart = useCallback(
    (itemId: string, itemType: "Product" | "Stay" | "Tour" | "Adventure" | "VehicleRental", variantId?: string | null) => {
      return items.some(
        (item) =>
          item.itemId === itemId &&
          item.itemType === itemType &&
          (variantId ? item.variantId === variantId : true)
      );
    },
    [items]
  );

  const productTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.itemType !== "Product") return sum;
      const price = item.variant?.price ?? item.item?.price ?? item.item?.basePrice ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  useEffect(() => {
    if (autoLoad) refresh();
  }, [autoLoad, refresh]);

  return {
    items,
    loading,
    error,
    cartLoaded: loadedOnce,
    refresh,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    totalItems,
    totalPrice,
    productTotal,
  };
}

