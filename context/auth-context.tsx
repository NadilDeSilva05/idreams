"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface ShopkeeperUser {
  uid: string;
  name: string;
  email: string;
  shopName: string;
  phone: string;
  role: "Shopkeeper";
  createdAt: string;
}

interface AuthContextType {
  user: ShopkeeperUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<ShopkeeperUser | null> {
  const profileRef = doc(db, "users", firebaseUser.uid, "profile", "info");
  const snap = await getDoc(profileRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: firebaseUser.uid,
    name: data.name || "",
    email: firebaseUser.email || "",
    shopName: data.shopName || "",
    phone: data.phone || "",
    role: "Shopkeeper",
    createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopkeeperUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await fetchUserProfile(cred.user);
      setUser(profile);
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      const messages: Record<string, string> = {
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/too-many-requests": "Too many failed attempts. Please wait a moment.",
        "auth/invalid-email": "Invalid email address.",
      };
      return { success: false, error: messages[code] || "Sign in failed. Please try again." };
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
    phone: string;
  }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const uid = cred.user.uid;

      // Write the shopkeeper profile to Firestore
      const profileRef = doc(db, "users", uid, "profile", "info");
      await setDoc(profileRef, {
        name: data.name.trim(),
        shopName: data.shopName.trim(),
        phone: data.phone.trim(),
        role: "Shopkeeper",
        createdAt: serverTimestamp(),
      });

      const newUser: ShopkeeperUser = {
        uid,
        name: data.name.trim(),
        email: data.email.trim(),
        shopName: data.shopName.trim(),
        phone: data.phone.trim(),
        role: "Shopkeeper",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setUser(newUser);
      return { success: true };
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      const rawMessage = (err as { message?: string }).message || "";
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Invalid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase Console. Go to Authentication -> Sign-in method -> Enable Email/Password.",
        "auth/configuration-not-found": "Email/Password sign-in is not enabled in Firebase Console. Go to Authentication -> Sign-in method -> Enable Email/Password.",
      };
      return { success: false, error: messages[code] || rawMessage || "Registration failed. Please try again." };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    router.push("/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
