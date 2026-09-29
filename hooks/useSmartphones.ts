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

  const addSmartphone = async (data: Omit<GroupedSmartphone, "id" | "createdAt">) => {
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "smartphones");
    const sanitized = sanitizeFirestoreData(data);
    await addDoc(ref, {
      ...sanitized,
      stocks: sanitized.stocks || [],
      createdAt: serverTimestamp(),
    });
  };

  const updateSmartphone = async (id: string, data: Partial<GroupedSmartphone>) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "smartphones", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
  };

  const deleteSmartphone = async (id: string) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "smartphones", id);
    await deleteDoc(ref);
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
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: arrayUnion(...newStockItems),
    });
  };

  const deleteStock = async (smartphoneId: string, stockId: string) => {
    if (!ownerUid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentStocks = phone.stocks || [];
    const updatedStocks = currentStocks.filter((s) => s.id !== stockId);
    const ref = doc(db, "users", ownerUid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: updatedStocks,
    });
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
  };
}
