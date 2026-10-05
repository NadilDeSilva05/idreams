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
import { writeHistory } from "@/hooks/useHistory";

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
    const docRef = await addDoc(ref, { ...sanitized, stocks: sanitized.stocks || [], createdAt: serverTimestamp() });
    writeHistory(ownerUid, {
      category: "accessory",
      action: "create",
      entityId: docRef.id,
      entityLabel: data.name,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        name: data.name,
        brand: data.brand,
        category: data.category,
        price: data.price,
        specifications: data.specifications,
      },
    }).catch(() => {});
  };

  const updateAccessory = async (id: string, data: Partial<Accessory>) => {
    if (!ownerUid) return;
    const existing = accessories.find((a) => a.id === id);
    const ref = doc(db, "users", ownerUid, "accessories", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
    writeHistory(ownerUid, {
      category: "accessory",
      action: "update",
      entityId: id,
      entityLabel: existing?.name || data.name || id,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        name: data.name || existing?.name,
        brand: data.brand || existing?.brand,
        category: data.category,
        price: data.price,
        specifications: data.specifications,
      },
      oldValue: existing ? { name: existing.name, brand: existing.brand, category: existing.category, price: existing.price } : undefined,
      newValue: { name: data.name, brand: data.brand, category: data.category, price: data.price },
    }).catch(() => {});
  };

  const deleteAccessory = async (id: string) => {
    if (!ownerUid) return;
    const existing = accessories.find((a) => a.id === id);
    const ref = doc(db, "users", ownerUid, "accessories", id);
    await deleteDoc(ref);
    writeHistory(ownerUid, {
      category: "accessory",
      action: "delete",
      entityId: id,
      entityLabel: existing?.name || id,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        name: existing?.name,
        brand: existing?.brand,
        category: existing?.category,
        price: existing?.price,
        stockCount: existing?.stocks?.length || 0,
      },
    }).catch(() => {});
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
    const accessory = accessories.find((a) => a.id === accessoryId);
    const ref = doc(db, "users", ownerUid, "accessories", accessoryId);
    await updateDoc(ref, {
      stocks: arrayUnion(...newStockItems),
    });
    newStockItems.forEach((stock, i) => {
      writeHistory(ownerUid, {
        category: "stock",
        action: "stock_add",
        entityId: stock.id,
        entityLabel: accessory?.name || accessoryId,
        userUid: user?.uid,
        userName: user?.name,
        userRole: user?.role,
        payload: {
          type: "accessory",
          product: accessory?.name,
          accessoryId,
          category: accessory?.category,
          qty: stock.quantity,
          purchasePrice: stock.purchasePrice,
          supplier: stock.supplier,
          notes: stock.notes,
          batch: i + 1,
          batchSize: newStockItems.length,
        },
      }).catch(() => {});
    });
  };

  const deleteAccessoryStock = async (accessoryId: string, stockId: string) => {
    if (!ownerUid) return;
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory) return;
    const currentStocks = accessory.stocks || [];
    const removed = currentStocks.find((s) => s.id === stockId);
    const updatedStocks = currentStocks.filter((s) => s.id !== stockId);
    const ref = doc(db, "users", ownerUid, "accessories", accessoryId);
    await updateDoc(ref, { stocks: updatedStocks });
    writeHistory(ownerUid, {
      category: "stock",
      action: "stock_remove",
      entityId: stockId,
      entityLabel: accessory.name,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        type: "accessory",
        product: accessory.name,
        accessoryId,
        category: accessory.category,
        qty: removed?.quantity,
        purchasePrice: removed?.purchasePrice,
        supplier: removed?.supplier,
      },
    }).catch(() => {});
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
