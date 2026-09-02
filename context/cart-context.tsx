"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { CartItem } from "@/types/smartphone";

interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalQuantity: number;
  addToCart: (item: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const generateCartItemId = (brand: string, model: string, storage: string) => {
    return `${brand}-${model}-${storage}`.replace(/\s+/g, "-").toLowerCase();
  };

  const addToCart = (item: Omit<CartItem, "id" | "quantity">) => {
    setItems((prevItems) => {
      const id = generateCartItemId(item.brand, item.model, item.storage);
      const existingItem = prevItems.find((i) => i.id === id);

      if (existingItem) {
        return prevItems.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prevItems, { ...item, id, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalQuantity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

