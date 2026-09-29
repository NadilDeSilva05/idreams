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
import { db, sanitizeFirestoreData } from "@/lib/firebase";
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
  customerWhatsapp?: string;
  notes?: string;
}

export function useRepairs() {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ownerUid so shopkeepers see the same repairs as the shop owner
  const ownerUid = user?.ownerUid;

  useEffect(() => {
    if (!ownerUid) {
      setRepairs([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", ownerUid, "repairs");
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
  }, [ownerUid]);

  const addRepair = async (data: Omit<Repair, "id">) => {
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "repairs");
    const sanitized = sanitizeFirestoreData(data);
    await addDoc(ref, {
      ...sanitized,
      dateCreated: serverTimestamp(),
    });
  };

  const updateRepair = async (id: string, data: Partial<Repair>) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "repairs", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
  };

  const deleteRepair = async (id: string) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "repairs", id);
    await deleteDoc(ref);
  };

  return { repairs, loading, error, addRepair, updateRepair, deleteRepair };
}
