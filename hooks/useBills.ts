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
import { writeHistory } from "@/hooks/useHistory";

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

export type BillItemCategory = "smartphone" | "accessory" | "repair";

export function inferBillItemCategory(item: BillItem): BillItemCategory {
  if (item.smartphoneId || item.imei) return "smartphone";
  const haystack = `${item.name || ""} ${item.storage || ""} ${item.model || ""}`;
  if (
    haystack.includes("Ticket:") ||
    haystack.includes("Repair") ||
    haystack.includes("Screen Replacement") ||
    haystack.includes("Battery Replacement") ||
    haystack.includes("Charging") ||
    haystack.includes("Camera") ||
    haystack.includes("Back Glass") ||
    haystack.includes("Speaker") ||
    haystack.includes("Mic") ||
    haystack.includes("Water")
  )
    return "repair";
  return "accessory";
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
    const docRef = await addDoc(ref, { ...sanitized, createdAt: serverTimestamp() });
    writeHistory(ownerUid, {
      category: "bill",
      action: "sale",
      entityId: docRef.id,
      entityLabel: `Invoice ${data.id}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        invoiceId: data.id,
        customer: data.customer,
        phone: data.phone,
        status: data.status,
        paymentMethod: data.paymentMethod,
        itemCount: data.itemCount,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        amountPaid: data.amountPaid,
        cashier: data.cashier,
        itemsSummary: (data.items || []).map((it) => ({
          name: it.name,
          qty: it.qty,
          price: it.price,
          category: inferBillItemCategory(it),
          smartphoneId: it.smartphoneId,
          imei: it.imei,
        })),
      },
    }).catch(() => {});
  };

  const updateBill = async (firestoreId: string, data: Partial<Bill>) => {
    if (!ownerUid) return;
    const existing = bills.find((b) => b.firestoreId === firestoreId);
    const ref = doc(db, "users", ownerUid, "bills", firestoreId);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
    let action: "update" | "status_change" | "undo" | "payment" = "update";
    if (data.status === "Undone" && existing?.status !== "Undone") action = "undo";
    else if (
      data.status &&
      existing &&
      data.status !== existing.status
    )
      action = "status_change";
    else if (
      typeof data.amountPaid === "number" &&
      existing &&
      data.amountPaid !== existing.amountPaid
    )
      action = "payment";
    writeHistory(ownerUid, {
      category: "bill",
      action,
      entityId: firestoreId,
      entityLabel: `Invoice ${existing?.id || data.id || firestoreId}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        invoiceId: data.id || existing?.id,
        customer: data.customer || existing?.customer,
        phone: data.phone || existing?.phone,
        status: data.status,
        paymentMethod: data.paymentMethod || existing?.paymentMethod,
        itemCount: data.itemCount || existing?.itemCount,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        amountPaid: data.amountPaid,
        undoReason: data.undoReason,
        undoneAt: data.undoneAt,
      },
      oldValue: existing
        ? {
            status: existing.status,
            total: existing.total,
            amountPaid: existing.amountPaid,
          }
        : undefined,
      newValue: {
        status: data.status,
        total: data.total,
        amountPaid: data.amountPaid,
      },
    }).catch(() => {});
  };

  const deleteBill = async (firestoreId: string) => {
    if (!ownerUid) return;
    const existing = bills.find((b) => b.firestoreId === firestoreId);
    const ref = doc(db, "users", ownerUid, "bills", firestoreId);
    await deleteDoc(ref);
    writeHistory(ownerUid, {
      category: "bill",
      action: "delete",
      entityId: firestoreId,
      entityLabel: `Invoice ${existing?.id || firestoreId}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        invoiceId: existing?.id,
        customer: existing?.customer,
        phone: existing?.phone,
        status: existing?.status,
        paymentMethod: existing?.paymentMethod,
        itemCount: existing?.itemCount,
        total: existing?.total,
        amountPaid: existing?.amountPaid,
        cashier: existing?.cashier,
      },
    }).catch(() => {});
  };

  return { bills, loading, error, addBill, updateBill, deleteBill };
}
