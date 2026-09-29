"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { db, sanitizeFirestoreData } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export interface AccessoryStockItem {
  id: string;
  quantity: number;
  purchasePrice?: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface Accessory {
  id?: string;
  category:
    | "charging-docks"
    | "power-banks"
    | "car-chargers"
    | "camera-lens"
    | "back-covers"
    | "tempered-glass"
    | "cables";
  name: string;
  brand: string;
  specifications?: string;
  price: number;
  inStock: boolean;
  stocks?: AccessoryStockItem[];
  createdAt?: any;
}

export const categoryLabels = {
  "charging-docks": "Charging Docks",
  "power-banks": "Power Banks",
  "car-chargers": "Car Chargers",
  "camera-lens": "Camera Lens",
  "back-covers": "Back Covers",
  "tempered-glass": "Tempered Glass",
  cables: "Cables",
} as const;

export function useAccessories() {
  const { user } = useAuth();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ownerUid so shopkeepers see the same data as the owner
  const ownerUid = user?.ownerUid;

  useEffect(() => {
    if (!ownerUid) {
      setAccessories([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", ownerUid, "accessories");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Accessory[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...(data as Omit<Accessory, "id">),
            stocks: Array.isArray(data.stocks) ? data.stocks : [],
          };
        });
        setAccessories(items);
        setLoading(false);
      },
      (err) => {
        console.error("Accessories listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerUid]);

  const addAccessory = async (data: Omit<Accessory, "id" | "createdAt">) => {
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "accessories");
    const sanitized = sanitizeFirestoreData(data);
    await addDoc(ref, { ...sanitized, stocks: sanitized.stocks || [], createdAt: serverTimestamp() });
  };

  const updateAccessory = async (id: string, data: Partial<Accessory>) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "accessories", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
  };

  const deleteAccessory = async (id: string) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "accessories", id);
    await deleteDoc(ref);
  };

  // Stock management for accessories (same pattern as smartphones)
  const addAccessoryStock = async (
    accessoryId: string,
    stockData:
      | Omit<AccessoryStockItem, "id" | "createdAt">
      | Omit<AccessoryStockItem, "id" | "createdAt">[]
  ) => {
    if (!ownerUid) return;
    const items = Array.isArray(stockData) ? stockData : [stockData];
    if (items.length === 0) return;
    const newStockItems: AccessoryStockItem[] = items.map((s, idx) => {
      const cleanItem = sanitizeFirestoreData(s);
      return {
        ...cleanItem,
        id: "astk_" + (Date.now() + idx) + "_" + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
    });
    const ref = doc(db, "users", ownerUid, "accessories", accessoryId);
    await updateDoc(ref, {
      stocks: arrayUnion(...newStockItems),
    });
  };

  const deleteAccessoryStock = async (accessoryId: string, stockId: string) => {
    if (!ownerUid) return;
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory) return;
    const currentStocks = accessory.stocks || [];
    const updatedStocks = currentStocks.filter((s) => s.id !== stockId);
    const ref = doc(db, "users", ownerUid, "accessories", accessoryId);
    await updateDoc(ref, { stocks: updatedStocks });
  };

  const updateAccessoryStock = async (
    accessoryId: string,
    stockId: string,
    data: Partial<AccessoryStockItem>
  ) => {
    if (!ownerUid) return;
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory) return;
    const currentStocks = accessory.stocks || [];
    const updatedStocks = currentStocks.map((s) =>
      s.id === stockId ? { ...s, ...data } : s
    );
    const ref = doc(db, "users", ownerUid, "accessories", accessoryId);
    await updateDoc(ref, { stocks: updatedStocks });
  };

  // Total stock quantity for an accessory
  const getTotalStock = (accessoryId: string): number => {
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory?.stocks) return 0;
    return accessory.stocks.reduce((sum, s) => sum + (s.quantity || 0), 0);
  };

  return {
    accessories,
    loading,
    error,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    addAccessoryStock,
    deleteAccessoryStock,
    updateAccessoryStock,
    getTotalStock,
  };
}
