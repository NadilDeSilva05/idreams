export interface Repair {
  id: string;
  deviceType: "smartphone" | "laptop";
  brand?: string;
  model: string;
  storage?: string;
  repairType: string;
  price: number;
  dateCreated: Date;
  status: "pending" | "in-progress" | "completed";
}
