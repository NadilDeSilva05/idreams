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
import {
  GroupedSmartphone,
  SmartphoneStorageVariant,
  SmartphoneStockItem,
} from "@/types/smartphone";
import { writeHistory } from "@/hooks/useHistory";

export type { GroupedSmartphone, SmartphoneStorageVariant, SmartphoneStockItem };

export function useSmartphones() {
  const { user } = useAuth();
  const [smartphones, setSmartphones] = useState<GroupedSmartphone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ownerUid so shopkeepers see the same data as the owner
  const ownerUid = user?.ownerUid;

  useEffect(() => {
    if (!ownerUid) {
      setSmartphones([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", ownerUid, "smartphones");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: GroupedSmartphone[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...(data as Omit<GroupedSmartphone, "id">),
            stocks: Array.isArray(data.stocks) ? data.stocks : [],
          };
        });
        setSmartphones(items);
        setLoading(false);
      },
      (err) => {
        console.error("Smartphones listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerUid]);

  const addSmartphone = async (data: Omit<GroupedSmartphone, "id" | "createdAt">): Promise<string | null> => {
    if (!ownerUid) return null;
    const ref = collection(db, "users", ownerUid, "smartphones");
    const sanitized = sanitizeFirestoreData(data);
    const docRef = await addDoc(ref, {
      ...sanitized,
      stocks: sanitized.stocks || [],
      createdAt: serverTimestamp(),
    });
    writeHistory(ownerUid, {
      category: "smartphone",
      action: "create",
      entityId: docRef.id,
      entityLabel: `${data.brand} ${data.model}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        brand: data.brand,
        model: data.model,
        category: data.category,
        variants: data.variants?.length || 0,
      },
    }).catch(() => {});
    return docRef.id;
  };

  const updateSmartphone = async (id: string, data: Partial<GroupedSmartphone>) => {
    if (!ownerUid) return;
    const existing = smartphones.find((s) => s.id === id);
    const ref = doc(db, "users", ownerUid, "smartphones", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
    writeHistory(ownerUid, {
      category: "smartphone",
      action: "update",
      entityId: id,
      entityLabel: existing ? `${existing.brand} ${existing.model}` : data.model || id,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        brand: data.brand || existing?.brand,
        model: data.model || existing?.model,
        category: data.category,
        variants: data.variants?.length,
      },
      oldValue: existing ? { brand: existing.brand, model: existing.model, category: existing.category, variants: existing.variants?.length } : undefined,
      newValue: { brand: data.brand, model: data.model, category: data.category, variants: data.variants?.length },
    }).catch(() => {});
  };

  const deleteSmartphone = async (id: string) => {
    if (!ownerUid) return;
    const existing = smartphones.find((s) => s.id === id);
    const ref = doc(db, "users", ownerUid, "smartphones", id);
    await deleteDoc(ref);
    writeHistory(ownerUid, {
      category: "smartphone",
      action: "delete",
      entityId: id,
      entityLabel: existing ? `${existing.brand} ${existing.model}` : id,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        brand: existing?.brand,
        model: existing?.model,
        category: existing?.category,
        stockCount: existing?.stocks?.length || 0,
      },
    }).catch(() => {});
  };

  const addStock = async (
    smartphoneId: string,
    stockData:
      | Omit<SmartphoneStockItem, "id" | "createdAt">
      | Omit<SmartphoneStockItem, "id" | "createdAt">[]
  ) => {
    if (!ownerUid) return;
    const items = Array.isArray(stockData) ? stockData : [stockData];
    if (items.length === 0) return;
    const newStockItems: SmartphoneStockItem[] = items.map((s, idx) => {
      const cleanItem = sanitizeFirestoreData(s);
      return {
        ...cleanItem,
        id: "stk_" + (Date.now() + idx) + "_" + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        status: cleanItem.status || "Available",
      };
    });
    const phone = smartphones.find((p) => p.id === smartphoneId);
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: arrayUnion(...newStockItems),
    });
    newStockItems.forEach((stock, i) => {
      writeHistory(ownerUid, {
        category: "stock",
        action: "stock_add",
        entityId: stock.id,
        entityLabel: phone ? `${phone.brand} ${phone.model}` : stock.imei || smartphoneId,
        userUid: user?.uid,
        userName: user?.name,
        userRole: user?.role,
        payload: {
          type: "smartphone",
          product: phone ? `${phone.brand} ${phone.model}` : undefined,
          smartphoneId,
          storage: stock.storage,
          imei: stock.imei,
          type_condition: stock.type,
          batteryHealth: stock.batteryHealth,
          color: stock.color,
          qty: 1,
          batch: i + 1,
          batchSize: newStockItems.length,
        },
      }).catch(() => {});
    });
  };

  const deleteStock = async (smartphoneId: string, stockId: string) => {
    if (!ownerUid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentStocks = phone.stocks || [];
    const removed = currentStocks.find((s) => s.id === stockId);
    const updatedStocks = currentStocks.filter((s) => s.id !== stockId);
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: updatedStocks,
    });
    writeHistory(ownerUid, {
      category: "stock",
      action: "stock_remove",
      entityId: stockId,
      entityLabel: `${phone.brand} ${phone.model}${removed?.imei ? ` • ${removed.imei}` : ""}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        type: "smartphone",
        product: `${phone.brand} ${phone.model}`,
        smartphoneId,
        storage: removed?.storage,
        imei: removed?.imei,
        type_condition: removed?.type,
        batteryHealth: removed?.batteryHealth,
        color: removed?.color,
      },
    }).catch(() => {});
  };

  const updateStock = async (
    smartphoneId: string,
    stockId: string,
    data: Partial<SmartphoneStockItem>
  ) => {
    if (!ownerUid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentStocks = phone.stocks || [];
    const sanitized = sanitizeFirestoreData(data);
    const updatedStocks = currentStocks.map((s) =>
      s.id === stockId ? { ...s, ...sanitized } : s
    );
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: updatedStocks,
    });
  };

  const markStockSold = async (smartphoneId: string, stockId: string) => {
    await updateStock(smartphoneId, stockId, { status: "Sold" });
  };

  const markStockAvailable = async (smartphoneId: string, stockId: string) => {
    await updateStock(smartphoneId, stockId, { status: "Available" });
  };

  const updateVariantLastSellingPrice = async (
    smartphoneId: string,
    storage: string,
    lastSellingPrice: number
  ) => {
    if (!ownerUid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentVariants = phone.variants || [];
    const targetVariant = currentVariants.find(
      (v) => v.storage.trim().toLowerCase() === storage.trim().toLowerCase()
    );
    const oldLastPrice = targetVariant?.lastSellingPrice;
    const updatedVariants = currentVariants.map((v) =>
      v.storage.trim().toLowerCase() === storage.trim().toLowerCase()
        ? { ...v, lastSellingPrice }
        : v
    );
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, { variants: updatedVariants });
    if (oldLastPrice !== lastSellingPrice) {
      writeHistory(ownerUid, {
        category: "smartphone",
        action: "price_floor_update",
        entityId: smartphoneId,
        entityLabel: `${phone.brand} ${phone.model} • ${storage}`,
        userUid: user?.uid,
        userName: user?.name,
        userRole: user?.role,
        payload: {
          brand: phone.brand,
          model: phone.model,
          storage,
          lastSellingPrice,
          previousFloor: oldLastPrice,
        },
        oldValue: { lastSellingPrice: oldLastPrice },
        newValue: { lastSellingPrice },
      }).catch(() => {});
    }
  };

  return {
    smartphones,
    loading,
    error,
    addSmartphone,
    updateSmartphone,
    deleteSmartphone,
    addStock,
    deleteStock,
    updateStock,
    markStockSold,
    markStockAvailable,
    updateVariantLastSellingPrice,
  };
}
