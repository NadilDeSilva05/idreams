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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export interface SmartphoneStorageVariant {
  storage: string;
  price: number;
}

export interface GroupedSmartphone {
  id?: string;
  brand: string;
  model: string;
  category: "flagship" | "mid-range" | "budget";
  variants: SmartphoneStorageVariant[];
  createdAt?: Date;
}

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
        const items: GroupedSmartphone[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<GroupedSmartphone, "id">),
        }));
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
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
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

  return { smartphones, loading, error, addSmartphone, updateSmartphone, deleteSmartphone };
}
