"use client";

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db, sanitizeFirestoreData } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export type HistoryCategory =
  | "smartphone"
  | "accessory"
  | "repair"
  | "bill"
  | "stock";

export type HistoryAction =
  | "create"
  | "update"
  | "delete"
  | "stock_add"
  | "stock_remove"
  | "sale"
  | "status_change"
  | "undo"
  | "payment"
  | "price_floor_update";

export interface HistoryPayload {
  [key: string]: any;
}

export interface HistoryEntry {
  id?: string;
  category: HistoryCategory;
  action: HistoryAction;
  entityId?: string;
  entityLabel?: string;
  userUid?: string;
  userName?: string;
  userRole?: string;
  payload?: HistoryPayload;
  description?: string;
  oldValue?: any;
  newValue?: any;
  timestamp?: any;
}

export async function writeHistory(
  ownerUid: string,
  entry: Omit<HistoryEntry, "timestamp">
): Promise<void> {
  if (!ownerUid) return;
  try {
    const ref = collection(db, "users", ownerUid, "history");
    const sanitized = sanitizeFirestoreData(entry);
    await addDoc(ref, {
      ...sanitized,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("History write skipped:", (err as Error).message);
  }
}

export function logHistory(entry: Omit<HistoryEntry, "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const storedOwner =
      (window as any).__idreams_owneruid__ ||
      localStorage.getItem("__idreams_owneruid__") ||
      localStorage.getItem("__idreams_uid__");
    if (!storedOwner) return;
    writeHistory(storedOwner, entry).catch(() => {});
  } catch {
    /* fire-and-forget */
  }
}

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ownerUid = user?.ownerUid;

  useEffect(() => {
    if (!ownerUid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", ownerUid, "history");
    const q = query(ref, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: HistoryEntry[] = snapshot.docs.map((d) => {
          const data = d.data();
          let ts = data.timestamp;
          if (ts instanceof Timestamp) {
            ts = ts.toDate().toISOString();
          } else if (ts && typeof ts.toDate === "function") {
            ts = ts.toDate().toISOString();
          }
          return {
            id: d.id,
            ...(data as Omit<HistoryEntry, "id">),
            timestamp: ts,
          };
        });
        setHistory(items);
        setLoading(false);
      },
      (err) => {
        console.error("History listener error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ownerUid]);

  const addHistory = async (entry: Omit<HistoryEntry, "timestamp">) => {
    if (!ownerUid) return;
    const ref = collection(db, "users", ownerUid, "history");
    const sanitized = sanitizeFirestoreData(entry);
    await addDoc(ref, {
      ...sanitized,
      timestamp: Timestamp.now(),
    });
  };

  return { history, loading, error, addHistory };
}
