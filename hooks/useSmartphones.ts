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
import { db } from "@/lib/firebase";
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

  useEffect(() => {
    if (!user?.uid) {
      setSmartphones([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "smartphones");
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
  }, [user?.uid]);

  const addSmartphone = async (data: Omit<GroupedSmartphone, "id" | "createdAt">) => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "smartphones");
    await addDoc(ref, {
      ...data,
      stocks: data.stocks || [],
      createdAt: serverTimestamp(),
    });
  };

  const updateSmartphone = async (id: string, data: Partial<GroupedSmartphone>) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "smartphones", id);
    await updateDoc(ref, data);
  };

  const deleteSmartphone = async (id: string) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "smartphones", id);
    await deleteDoc(ref);
  };

  const addStock = async (
    smartphoneId: string,
    stockData: Omit<SmartphoneStockItem, "id" | "createdAt">
  ) => {
    if (!user?.uid) return;
    const newStockItem: SmartphoneStockItem = {
      ...stockData,
      id: "stk_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      status: stockData.status || "Available",
    };
    const ref = doc(db, "users", user.uid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: arrayUnion(newStockItem),
    });
  };

  const deleteStock = async (smartphoneId: string, stockId: string) => {
    if (!user?.uid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentStocks = phone.stocks || [];
    const updatedStocks = currentStocks.filter((s) => s.id !== stockId);
    const ref = doc(db, "users", user.uid, "smartphones", smartphoneId);
    await updateDoc(ref, {
      stocks: updatedStocks,
    });
  };

  const updateStock = async (
    smartphoneId: string,
    stockId: string,
    data: Partial<SmartphoneStockItem>
  ) => {
    if (!user?.uid) return;
    const phone = smartphones.find((s) => s.id === smartphoneId);
    if (!phone) return;
    const currentStocks = phone.stocks || [];
    const updatedStocks = currentStocks.map((s) =>
      s.id === stockId ? { ...s, ...data } : s
    );
    const ref = doc(db, "users", user.uid, "smartphones", smartphoneId);
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
