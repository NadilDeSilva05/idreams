# Selling History Page Implementation Plan

## Repository Research

### Current Sales History Architecture
- **Source of truth**: Bills collection at `users/{ownerUid}/bills`. Each bill document has nested `items: BillItem[]`. There is NO separate sales/history collection.
- **Bill items schema** (canonical in `hooks/useBills.ts`):
  - `name, qty, price` (shared by all 3 line-item types)
  - Smartphones additionally carry: `smartphoneId, stockItemId, imei, type ("Brand New" | "Used"), brand, model, storage` (denormalized snapshot at sale time)
  - Accessories / Repairs: currently carry only the base `name/qty/price` in the bill (because they are sold through Cart, but the Billing save flow does not explicitly tag item categories). Category for Accessories vs Repairs vs Smartphones must be **inferred from fields present in the BillItem + name format**.

### Three Sales Categories — How to Differentiate them
We need to tag every line item shown in the new page with an explicit category chip:

| Category | How to detect from a BillItem |
|---|---|
| 📱 Smartphone | `item.smartphoneId` is present OR `item.imei` is present |
| 🎧 Accessory | No smartphoneId/imei AND `item.name` does NOT start with / match a repair-ticket pattern, OR item was added from the accessories flow (brand-model-storage where `storage` was a spec, and the accessory `name` was used as `model`) |
| 🔧 Repair | `name` contains the pattern `(Screen Replacement / Battery Replacement / ...)` or line item was mapped from a repair ticket (repair page uses `model: \`${model} (${repairType})\`` and `storage: \`Ticket: ${id} • ${storage}\``). We can detect via: presence of `Ticket: ` substring in storage/name fields OR name ends with a known repair suffix pattern. |

**Fallback inference strategy** (deterministic for rendering a category pill on each line):
```
if (item.smartphoneId || item.imei)                     -> Smartphone
else if (name.includes("Ticket:") || name.includes("Repair")) -> Repair
else                                                    -> Accessory
```

### Existing Hooks & Data We Can Re-use
- `useBills()` at `hooks/useBills.ts` — exports `bills, loading, error, addBill, updateBill, deleteBill`. We'll read `bills` which is already live-synced to Firestore and sorted `orderBy("createdAt", "desc")`.
- `useSmartphones()` at `hooks/useSmartphones.ts` — for cross-referencing smartphones to enrich if we want to pull any extra data beyond the denormalized snapshot (not strictly required — bill already carries brand/model/storage/imei).
- `useAuth()` / `AuthGuard` ensures user is logged in and we have an `ownerUid` (bills hook already uses this internally).

### Navigation
- Primary sidebar: `components/navigation/drawer-navigation.tsx`. Must add:
  1. Import `HistoryRoundedIcon` from `@mui/icons-material`
  2. Add entry to `"SERVICES & SALES"` nav section (after Billing & POS): `{ label: "Selling History", icon: HistoryRoundedIcon, href: "/selling-history" }`
  3. Add `/selling-history` to the `isRelevantPage` allowlist (L98-107) so the sidebar renders on that route.
- Section layout passthrough: create `app/selling-history/layout.tsx` mirroring the other sections.

---

## Files and Modules

### New files (created)
1. `app/selling-history/page.tsx` — The main page with filters, item-level list, summary KPIs.
2. `app/selling-history/layout.tsx` — Minimal section passthrough layout (metadata only, same pattern as other sections).

### Existing files (edited)
3. `components/navigation/drawer-navigation.tsx` — Add nav link + allowlist entry (for sidebar).
4. `hooks/useBills.ts` — Optionally export a small helper `inferBillItemCategory(item) => "smartphone" | "accessory" | "repair"` (keeps inference logic out of the page component).

---

## Implementation Steps (Dependency Order)

### Step 1 — Types / helpers in useBills.ts
- Add a type `BillItemCategory = "smartphone" | "accessory" | "repair"` and export a pure helper `inferBillItemCategory(item: BillItem): BillItemCategory` using the fallback logic above.
- Export the helper in the `useBills` returned object so the page can pick it up (or export as standalone).

### Step 2 — Add route + passthrough layout
- Create `app/selling-history/layout.tsx`:
  ```
  export const metadata = { title: "Selling History - iDreams POS" };
  export default function Layout({ children }) { return <>{children}</>; }
  ```

### Step 3 — Navigation drawer update
- In `drawer-navigation.tsx`:
  - Add icon import
  - Append nav item to SERVICES & SALES section
  - Add `pathname === "/selling-history"` to `isRelevantPage` guard

### Step 4 — Build the page `app/selling-history/page.tsx`
The page is a **client component** (`"use client"`) that reads live bills from the hook and aggregates/flattens **bill items** to a single chronological list (so every phone, accessory and repair ticket shows as its own row with full bill context).

#### Page Layout Structure (top → bottom)
1. **AppBar / Header** (same pattern as other pages)
   - Title "Selling History" with subtitle "All sold smartphones · accessories · repairs"
   - Owner/shopkeeper chip + CartButton in the corner

2. **KPI Summary Cards row** (4 cards):
   - **Total Sales (LKR)** — Grand total of bill totals for non-Undone bills (₹ formatted with `en-LK`)
   - **Items Sold** — Sum of `item.qty` across non-Undone bills
   - **Smartphones Sold** — Count of smartphone items + their IMEIs (unique IMEI count badge)
   - **Repairs Completed** — Count of repair line items (only non-Undone)
   - **Accessories Sold** — Sum of accessory item qtys (can be 5th card or a chip)
   - Each card shows a small delta icon + category color ring

3. **Filters Bar** (sticky-ish) with:
   - **Category chips**: `All · Smartphones · Accessories · Repairs`
   - **Status chip**: `All · Paid · Pending · Partial · Undone` (bill-level status — since repairs/smartphone lines inherit status of their bill)
   - **Date range picker** (optional, lightweight: From / To `DatePicker`s) or at minimum: relative date shortcuts `Today · Last 7 days · Last 30 days · All`
   - **Text search**: Free-form — matches customer name, phone, item name, IMEI, ticket ID substring
   - **Sort toggle**: Newest first / Oldest first

4. **Itemized List Panel** — This is the core. Instead of showing *bills* (like Billing does), show **every sold line item as its own detailed row**, grouped by date or in a flat list:

   **Each Row Card** renders:
   - **Left colored stripe** (category-color coded: violet=Smartphone · emerald=Accessory · amber=Repair)
   - **Top row**: category chip + date & time of sale (`bill.createdAt` formatted) + bill status pill
   - **Item Name** (the `item.name` — e.g. `Apple iPhone 15 256GB Purple` for phones, or repair name, or accessory brand+name)
   - **Detail columns**:
     - For **Smartphones**: IMEI monospace badge, `type` chip (Brand New/Used), Customer name & phone from bill, warranty (if any), unit price, qty (usually 1), line total, `Bill #INV-xxx` link with bill id
     - For **Accessories**: supplier/specs if available, qty sold (may be >1), unit price, line total, `Bill #INV-xxx`
     - For **Repairs**: Ticket ID (parsed from the name/storage if present), repair type chip, device brand/model/customer from the bill context, price, bill id
   - **Right side**: Price (big formatted) + `INV-XXXX` pill

5. **Empty state** when no items match filters — illustration placeholder + helpful copy.

6. **PersistentCart** component mounted (same pattern as other pages), plus cart drawer toggle.

### Step 5 — Page Data flattening logic
Given `bills: Bill[]` (already sorted desc by createdAt):
```ts
// Flatten bills -> line items with bill-level context attached
type HistoryRow = {
  // identity
  category: "smartphone" | "accessory" | "repair";
  // line item fields (from BillItem)
  name: string; qty: number; price: number; warranty?: string;
  imei?: string; stockItemId?: string; smartphoneId?: string;
  type?: "Brand New" | "Used"; brand?: string; model?: string; storage?: string;
  // bill-level context
  billId: string; status: Bill["status"]; paymentMethod: Bill["paymentMethod"];
  customer: string; phone: string; date: string; time: string;
  createdAt: any;
};

const rows: HistoryRow[] = bills.flatMap((bill) =>
  bill.items.map((item) => ({
    category: inferBillItemCategory(item),
    ...item,
    billId: bill.id,
    status: bill.status,
    paymentMethod: bill.paymentMethod,
    customer: bill.customer,
    phone: bill.phone,
    date: bill.date,
    time: bill.time,
    createdAt: bill.createdAt,
  }))
);
```
Then apply the filters (category, status, date, search, sort) to the flattened `rows` array.

This approach guarantees every smartphone-IMEI pair, every repair-ticket, and every accessory-lot has its own fully-detailed row.

### Step 6 — "Full details" Accordion (optional, inside each row)
Because user said "fully detailed": put an MUI Accordion in each row (or a "Show Details" expand) so when expanded you see:
- For **Smartphones**: IMEI, stock item id, condition, storage, customer name + phone, bill date/time, payment method, bill status, line total, any warranty string
- For **Repairs**: parsed ticket id, brand+model, repair type, customer name/phone from bill, bill status, payment method
- For **Accessories**: qty, unit price, subtotal, customer/bill info

---

## Dependencies and Considerations

- **Existing components style**: Match existing pages — AppBar title alignment with `startAdornment` icon, cards have `borderRadius: 2`, `border: 1px solid #e2e8f0`, category colors follow theme (purple primary `#7c3aed`, orange secondary `#ea580c`, green for accessory `#10b981`, amber for repair `#f59e0b`).
- **Date format**: Use `Intl.DateTimeFormat("en-LK", { dateStyle: "medium", timeStyle: "short" })` for consistency with billing page.
- **Currency format**: `Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 })` — display `Rs.` prefix helper and `LKR` as currency.
- **No new Firebase writes**: This page is read-only. We MUST NOT write new documents. All data comes from bills already persisted in the billing flow.
- **Accessories & Repairs without full snapshots**: For accessories/repairs currently saved in bills WITHOUT explicit `brand/model/storage` denormalized fields, we just show what's on `item.name` + qty + price. Customer/date context still comes from the bill, so detail is "full" from the bill perspective.
- **Undone bills**: By default filter them out of KPI sums, but keep them visible in the item list via "Undone" status filter.
- **Performance**: Flat-mapping up to ~1000 bills × a few items each is fine in client memory; if it scales we can add pagination later, not needed yet.

---

## Validation

1. **TypeScript** — `npx tsc --noEmit` must exit 0.
2. **Route resolution** — Navigate to `/selling-history`, sidebar shows (allowlist works), page renders without blank screen or auth redirect loop.
3. **Flattening accuracy** — Pick a recent bill that has all 3 categories (or make one test bill that has a phone + an accessory + a repair) and confirm each shows as its own row with correct category chip and details.
4. **Filters & KPIs** — Category chips, status chips, search, date shortcuts should correctly slice the rows; KPI cards update accordingly.
5. **Navigation** — Clicking "Selling History" in the Services & Sales sidebar group correctly navigates to the page and highlights the active link.
6. **No regressions** — Billing page, accessories, repairs, smartphones pages still work and their own flows are unaffected. Cart icon, AppBar, owner badges all render correctly.

---

## Risks

| Risk | Handling |
|---|---|
| Cannot distinguish Accessory vs Repair perfectly in old bills (missing fields) | Use conservative inference, fall back to Accessory; add a clear visual marker/comment so user knows. Future: modify `handleSaveBill` in billing to write an explicit `category` field onto each BillItem. This plan does NOT add the denormalization write to billing save flow to keep scope bounded — it focuses on the history view. |
| Bill.createdAt is a Firestore Timestamp on fresh bills and might be undefined on very old drafts | Guard formatters with `?? new Date()`, fall back to bill's `date` string when timestamp is missing. |
| `useBills()` was not imported in a page-level client component before — risk of fetch loop? | It's a `useEffect`-less snapshot subscription (`onSnapshot`) with stable ownerUid. Same pattern used on smartphones/accessories/repairs pages — safe. |
| The flattening logic could produce duplicate rows if items.qty > 1 | Show qty as a column; do NOT split into qty×rows (1 row with qty = 3 is correct). The schema says `qty` is per line — the unit price × qty = line subtotal is displayed. |
