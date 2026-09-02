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
  notes?: string;
}

