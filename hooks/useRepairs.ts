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
    const docRef = await addDoc(ref, {
      ...sanitized,
      dateCreated: serverTimestamp(),
    });
    writeHistory(ownerUid, {
      category: "repair",
      action: "create",
      entityId: docRef.id,
      entityLabel: `${data.brand || data.deviceType} ${data.model} • ${data.repairType}`,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        deviceType: data.deviceType,
        brand: data.brand,
        model: data.model,
        storage: data.storage,
        repairType: data.repairType,
        price: data.price,
        status: data.status,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      },
    }).catch(() => {});
  };

  const updateRepair = async (id: string, data: Partial<Repair>) => {
    if (!ownerUid) return;
    const existing = repairs.find((r) => r.id === id);
    const ref = doc(db, "users", ownerUid, "repairs", id);
    const sanitized = sanitizeFirestoreData(data);
    await updateDoc(ref, sanitized as Record<string, unknown>);
    const isStatusChange =
      !!data.status && existing && data.status !== existing.status;
    writeHistory(ownerUid, {
      category: "repair",
      action: isStatusChange ? "status_change" : "update",
      entityId: id,
      entityLabel: existing
        ? `${existing.brand || existing.deviceType} ${existing.model} • ${existing.repairType}`
        : (data.model || id),
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        deviceType: data.deviceType || existing?.deviceType,
        brand: data.brand || existing?.brand,
        model: data.model || existing?.model,
        repairType: data.repairType || existing?.repairType,
        price: data.price,
        status: data.status,
        customerName: data.customerName || existing?.customerName,
        customerPhone: data.customerPhone || existing?.customerPhone,
      },
      oldValue: existing
        ? {
            status: existing.status,
            price: existing.price,
            repairType: existing.repairType,
          }
        : undefined,
      newValue: {
        status: data.status,
        price: data.price,
        repairType: data.repairType,
      },
    }).catch(() => {});
  };

  const deleteRepair = async (id: string) => {
    if (!ownerUid) return;
    const existing = repairs.find((r) => r.id === id);
    const ref = doc(db, "users", ownerUid, "repairs", id);
    await deleteDoc(ref);
    writeHistory(ownerUid, {
      category: "repair",
      action: "delete",
      entityId: id,
      entityLabel: existing
        ? `${existing.brand || existing.deviceType} ${existing.model} • ${existing.repairType}`
        : id,
      userUid: user?.uid,
      userName: user?.name,
      userRole: user?.role,
      payload: {
        deviceType: existing?.deviceType,
        brand: existing?.brand,
        model: existing?.model,
        repairType: existing?.repairType,
        price: existing?.price,
        status: existing?.status,
        customerName: existing?.customerName,
        customerPhone: existing?.customerPhone,
      },
    }).catch(() => {});
  };

  return { repairs, loading, error, addRepair, updateRepair, deleteRepair };
}
