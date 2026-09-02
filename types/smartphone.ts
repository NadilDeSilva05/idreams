export interface CartItem {
  id: string;
  brand: string;
  model: string;
  storage: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface SmartphoneProduct {
  id: string;
  brand: string;
  model: string;
  storage: string;
  price: number;
  category: "flagship" | "mid-range" | "budget";
  inStock: boolean;
}

export interface SmartphoneStorageVariant {
  storage: string;
  price: number;
}

export interface GroupedSmartphone {
  id?: string;
  brand: string;
  model: string;
  category: "flagship" | "mid-range" | "budget";
  variants: SmartphoneStorageVariant[];
  createdAt?: any;
}

