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

  useEffect(() => {
    if (!user?.uid) {
      setAccessories([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "accessories");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Accessory[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Accessory, "id">),
        }));
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
  }, [user?.uid]);

  const addAccessory = async (data: Omit<Accessory, "id" | "createdAt">) => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "accessories");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  };

  const updateAccessory = async (id: string, data: Partial<Accessory>) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "accessories", id);
    await updateDoc(ref, data);
  };

  const deleteAccessory = async (id: string) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "accessories", id);
    await deleteDoc(ref);
  };

  return { accessories, loading, error, addAccessory, updateAccessory, deleteAccessory };
}
