export interface PhoneModel {
  brand: string;
  model: string;
  storage: string[];
}

export const phoneModels: PhoneModel[] = [
  // iPhone
  { brand: "Apple", model: "iPhone 11", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 11 Pro", storage: ["64GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 11 Pro Max", storage: ["64GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone SE 2nd Gen", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 12 mini", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 12", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 12 Pro", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 12 Pro Max", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 13 mini", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 13", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 13 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 13 Pro Max", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone SE 3rd Gen", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 14", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 14 Plus", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 14 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 14 Pro Max", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 15", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 15 Plus", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 15 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 15 Pro Max", storage: ["256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 16", storage: ["128GB"] },
  { brand: "Apple", model: "iPhone 16 Plus", storage: ["128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 16 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 16 Pro Max", storage: ["256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 16e", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 17", storage: ["256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 17e", storage: ["256GB", "512GB"] },
  { brand: "Apple", model: "iPhone Air", storage: ["256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 17 Pro", storage: ["256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 17 Pro Max", storage: ["256GB", "512GB", "1TB", "2TB"] },
  // Google Pixel
  { brand: "Google", model: "Pixel 6", storage: ["128GB", "256GB"] },
  { brand: "Google", model: "Pixel 6 Pro", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Google", model: "Pixel 6a", storage: ["128GB"] },
  { brand: "Google", model: "Pixel 7", storage: ["128GB", "256GB"] },
  { brand: "Google", model: "Pixel 7 Pro", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Google", model: "Pixel 7a", storage: ["128GB"] },
  { brand: "Google", model: "Pixel 8", storage: ["128GB", "256GB"] },
  { brand: "Google", model: "Pixel 8 Pro", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Google", model: "Pixel 8a", storage: ["128GB", "256GB"] },
];
