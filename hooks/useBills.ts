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

export interface BillItem {
  name: string;
  qty: number;
  price: number;
  warranty?: string;
  smartphoneId?: string;
  stockItemId?: string;
  imei?: string;
  type?: "Brand New" | "Used";
  brand?: string;
  model?: string;
  storage?: string;
}

export interface Bill {
  id: string;
  firestoreId?: string;
  customer: string;
  phone: string;
  date: string;
  time?: string;
  dueDate?: string;
  itemCount: number;
  status: "Paid" | "Pending" | "Partial" | "Draft" | "Undone";
  paymentMethod: "Cash" | "Card" | "Bank Transfer" | "Split" | "Installment";
  items: BillItem[];
  subtotal: number;
  tax?: number;
  discount: number;
  total: number;
  amountPaid?: number;
  cashier: string;
  note?: string;
  createdAt?: any;
  undoneAt?: string;
  undoReason?: string;
}

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setBills([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", user.uid, "bills");
    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Bill[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            firestoreId: d.id,
            ...data,
          } as Bill;
        });
        setBills(items);
        setLoading(false);
      },
      (err) => {
        console.error("Bills listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const addBill = async (data: Omit<Bill, "firestoreId" | "createdAt">) => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "bills");
    await addDoc(ref, { ...data, createdAt: serverTimestamp() });
  };

  const updateBill = async (firestoreId: string, data: Partial<Bill>) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "bills", firestoreId);
    await updateDoc(ref, data as Record<string, unknown>);
  };

  const deleteBill = async (firestoreId: string) => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid, "bills", firestoreId);
    await deleteDoc(ref);
  };

  return { bills, loading, error, addBill, updateBill, deleteBill };
}
