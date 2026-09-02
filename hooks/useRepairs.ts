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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export interface Repair {
  id?: string;
  deviceType: "smartphone" | "laptop";
  brand?: string;
  model: string;
  storage?: string;
  repairType: string;
  price: number;
  dateCreated: any;
  status: "pending" | "in-progress" | "completed";
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export function useRepairs() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setRepairs([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "repairs");
    const q = query(ref, orderBy("dateCreated", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Repair[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            // Convert Firestore Timestamp to JS Date
            dateCreated:
              data.dateCreated instanceof Timestamp
                ? data.dateCreated.toDate()
                : new Date(data.dateCreated),
          } as Repair;
        });
        setRepairs(items);
        setLoading(false);
      },
      (err) => {
        console.error("Repairs listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const addRepair = async (data: Omit<Repair, "id">) => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "repairs");
    await addDoc(ref, {
      ...data,
      dateCreated: serverTimestamp(),
    });
  };

  const updateRepair = async (id: string, data: Partial<Repair>) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "repairs", id);
    await updateDoc(ref, data as Record<string, unknown>);
  };

  const deleteRepair = async (id: string) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "repairs", id);
    await deleteDoc(ref);
  };

  return { repairs, loading, error, addRepair, updateRepair, deleteRepair };
}
