export interface CartItem {
  id: string;
  brand: string;
  model: string;
  storage: string;
  price: number;
  quantity: number;
  image?: string;
  type?: "Brand New" | "Used";
  stockItemId?: string;
  imei?: string;
  smartphoneId?: string;
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

export interface SmartphoneStockItem {
  id: string;
  storage: string;
  imei: string;
  type: "Brand New" | "Used";
  batteryHealth?: number | null;
  status?: "Available" | "Sold";
  color?: string;
  notes?: string;
  createdAt: string;
}

export interface SmartphoneStorageVariant {
  storage: string;
  price: number;       // retail price
  costPrice?: number;  // cost / purchase price
  lastSellingPrice?: number; // last recorded selling price (floor for add to cart)
}

export interface GroupedSmartphone {
  id?: string;
  brand: string;
  model: string;
  category: "flagship" | "mid-range" | "budget";
  variants: SmartphoneStorageVariant[];
  stocks?: SmartphoneStockItem[];
  createdAt?: any;
}

