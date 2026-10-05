export interface PhoneModel {
  brand: string;
  model: string;
  storage: string[];
  /** If true, this model can be sold as Brand New in addition to Used */
  isBrandNewCapable?: boolean;
}

export const phoneModels: PhoneModel[] = [
  // ─── Apple iPhone ─────────────────────────────────────────────────────────
  // iPhone 11 series (used only)
  { brand: "Apple", model: "iPhone 11", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 11 Pro", storage: ["64GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 11 Pro Max", storage: ["64GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone SE 2nd Gen", storage: ["64GB", "128GB", "256GB"] },
  // iPhone 12 series (used only)
  { brand: "Apple", model: "iPhone 12 mini", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 12", storage: ["64GB", "128GB", "256GB"] },
  { brand: "Apple", model: "iPhone 12 Pro", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 12 Pro Max", storage: ["128GB", "256GB", "512GB"] },
  // iPhone 13 series (used only)
  { brand: "Apple", model: "iPhone 13 mini", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 13", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 13 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 13 Pro Max", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone SE 3rd Gen", storage: ["64GB", "128GB", "256GB"] },
  // iPhone 14 series (used only)
  { brand: "Apple", model: "iPhone 14", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 14 Plus", storage: ["128GB", "256GB", "512GB"] },
  { brand: "Apple", model: "iPhone 14 Pro", storage: ["128GB", "256GB", "512GB", "1TB"] },
  { brand: "Apple", model: "iPhone 14 Pro Max", storage: ["128GB", "256GB", "512GB", "1TB"] },
  // iPhone 15 series (Brand New + Used)
  { brand: "Apple", model: "iPhone 15", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 15 Plus", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 15 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 15 Pro Max", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  // iPhone 16 series (Brand New + Used)
  { brand: "Apple", model: "iPhone 16", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 16 Plus", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 16 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 16 Pro Max", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 16e", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  // iPhone 17 series (Brand New + Used)
  { brand: "Apple", model: "iPhone 17", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 17e", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone Air", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 17 Pro", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 17 Pro Max", storage: ["256GB", "512GB", "1TB", "2TB"], isBrandNewCapable: true },
  // iPhone 18 series (Brand New + Used)
  { brand: "Apple", model: "iPhone 18", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 18 Slim", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 18 Pro", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Apple", model: "iPhone 18 Pro Max", storage: ["256GB", "512GB", "1TB", "2TB"], isBrandNewCapable: true },

  // ─── Google Pixel ─────────────────────────────────────────────────────────
  // Pixel 6 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 6", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 6 Pro", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 6a", storage: ["128GB"], isBrandNewCapable: true },
  // Pixel 7 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 7", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 7 Pro", storage: ["128GB", "256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 7a", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  // Pixel 8 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 8", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 8 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 8a", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  // Pixel 9 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 9", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 9 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 9 Pro XL", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 9 Pro Fold", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 9a", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  // Pixel 10 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 10", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 10 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 10 Pro XL", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 10 Pro Fold", storage: ["256GB", "512GB"], isBrandNewCapable: true },
  // Pixel 11 series (Brand New + Used)
  { brand: "Google Pixel", model: "Pixel 11", storage: ["128GB", "256GB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 11 Pro", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
  { brand: "Google Pixel", model: "Pixel 11 Pro XL", storage: ["256GB", "512GB", "1TB"], isBrandNewCapable: true },
];

/** Set of model names that support Brand New stock (iPhone 15+ / Pixel 6+) */
export const brandNewCapableModels = new Set(
  phoneModels.filter((m) => m.isBrandNewCapable).map((m) => m.model)
);

