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

export type UserRole = "ShopOwner" | "Shopkeeper";

export interface ShopkeeperUser {
  uid: string;
  ownerUid: string; // For ShopOwner: same as uid. For Shopkeeper: the owner's uid
  name: string;
  email: string;
  shopName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: ShopkeeperUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isShopkeeper: boolean;
  signIn: (email: string, password: string, roleOverride?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
    phone: string;
    role: UserRole;
    ownerUid?: string; // Required for Shopkeeper role
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserProfile(firebaseUser: FirebaseUser): Promise<ShopkeeperUser> {
  const profileRef = doc(db, "users", firebaseUser.uid, "profile", "info");
  const snap = await getDoc(profileRef);
  const data = snap.exists() ? snap.data() : {};
  const role = (data.role as UserRole) || "Shopkeeper";
  // For ShopOwner, ownerUid is their own uid. For Shopkeeper, read stored ownerUid.
  const ownerUid = role === "ShopOwner" ? firebaseUser.uid : (data.ownerUid || firebaseUser.uid);
  return {
    uid: firebaseUser.uid,
    ownerUid,
    name: data.name || firebaseUser.displayName || "Shop Manager",
    email: firebaseUser.email || "",
    shopName: data.shopName || "iDreams Store",
    phone: data.phone || "",
    role,
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

  const signIn = async (email: string, password: string, roleOverride?: UserRole) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      let profile = await fetchUserProfile(cred.user);
      if (roleOverride && profile.role !== roleOverride) {
        profile = { ...profile, role: roleOverride };
        const profileRef = doc(db, "users", cred.user.uid, "profile", "info");
        await setDoc(profileRef, { role: roleOverride }, { merge: true });
      }
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
    role: UserRole;
    ownerUid?: string;
  }) => {
    try {
      // If Shopkeeper, verify the ownerUid format and check profile if accessible
      if (data.role === "Shopkeeper") {
        if (!data.ownerUid?.trim()) {
          return { success: false, error: "A Store Code is required for Shopkeeper accounts." };
        }
        try {
          const ownerProfileRef = doc(db, "users", data.ownerUid.trim(), "profile", "info");
          const ownerSnap = await getDoc(ownerProfileRef);
          if (ownerSnap.exists()) {
            const ownerData = ownerSnap.data();
            if (ownerData.role && ownerData.role !== "ShopOwner") {
              return { success: false, error: "The provided Store Code does not belong to a Shop Owner." };
            }
          }
        } catch (readErr: unknown) {
          // If Firestore security rules restrict unauthenticated cross-user reads, proceed with signup
          console.warn("Could not pre-fetch owner profile (handled gracefully):", readErr);
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      const uid = cred.user.uid;
      const ownerUid = data.role === "ShopOwner" ? uid : data.ownerUid!.trim();

      // Write the user profile to Firestore with role and ownerUid
      const profileRef = doc(db, "users", uid, "profile", "info");
      await setDoc(profileRef, {
        name: data.name.trim(),
        shopName: data.shopName.trim(),
        phone: data.phone.trim(),
        role: data.role,
        ownerUid,
        createdAt: serverTimestamp(),
      });

      const newUser: ShopkeeperUser = {
        uid,
        ownerUid,
        name: data.name.trim(),
        email: data.email.trim(),
        shopName: data.shopName.trim(),
        phone: data.phone.trim(),
        role: data.role,
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

  const isOwner = user?.role === "ShopOwner";
  const isShopkeeper = user?.role === "Shopkeeper";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isOwner,
        isShopkeeper,
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
