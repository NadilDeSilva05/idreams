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

  // Use ownerUid so shopkeepers see the same bills as the shop owner
  const ownerUid = user?.ownerUid;

  useEffect(() => {
    if (!ownerUid) {
      setBills([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", ownerUid, "bills");
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
  }, [ownerUid]);

  const addBill = async (data: Omit<Bill, "firestoreId" | "createdAt">) => {
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "bills");
    const sanitized = sanitizeFirestoreData(data);
    await addDoc(ref, { ...sanitized, createdAt: serverTimestamp() });
  };

  const updateBill = async (firestoreId: string, data: Partial<Bill>) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "bills", firestoreId);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
  };

  const deleteBill = async (firestoreId: string) => {
    if (!ownerUid) return;
    const ref = doc(db, "users", ownerUid, "bills", firestoreId);
    await deleteDoc(ref);
  };

  return { bills, loading, error, addBill, updateBill, deleteBill };
}
