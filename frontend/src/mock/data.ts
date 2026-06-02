export type LocationItem = {
  id: string;
  name: string;
  address: string;
  currentRating: number;
  totalReviews: number;
};

export type MonthlyStat = {
  month: string; // YYYY-MM
  avgRating: number;
  count: number;
};

export const mockLocations: LocationItem[] = [
  {
    id: "loc_1",
    name: "Black Honey — Downtown",
    address: "12 Main St",
    currentRating: 4.6,
    totalReviews: 382,
  },
  {
    id: "loc_2",
    name: "Black Honey — Riverside",
    address: "48 River Rd",
    currentRating: 4.3,
    totalReviews: 219,
  },
  {
    id: "loc_3",
    name: "Black Honey — Mall",
    address: "Unit 7, City Mall",
    currentRating: 4.1,
    totalReviews: 511,
  },
];

const loc1: MonthlyStat[] = [
  { month: "2025-11", avgRating: 4.4, count: 18 },
  { month: "2025-12", avgRating: 4.5, count: 24 },
  { month: "2026-01", avgRating: 4.6, count: 29 },
  { month: "2026-02", avgRating: 4.7, count: 22 },
  { month: "2026-03", avgRating: 4.6, count: 31 },
  { month: "2026-04", avgRating: 4.6, count: 27 },
];

const loc2: MonthlyStat[] = [
  { month: "2025-11", avgRating: 4.1, count: 9 },
  { month: "2025-12", avgRating: 4.2, count: 14 },
  { month: "2026-01", avgRating: 4.3, count: 17 },
  { month: "2026-02", avgRating: 4.4, count: 15 },
  { month: "2026-03", avgRating: 4.3, count: 20 },
  { month: "2026-04", avgRating: 4.3, count: 16 },
];

const loc3: MonthlyStat[] = [
  { month: "2025-11", avgRating: 4.0, count: 28 },
  { month: "2025-12", avgRating: 4.1, count: 42 },
  { month: "2026-01", avgRating: 4.2, count: 55 },
  { month: "2026-02", avgRating: 4.0, count: 38 },
  { month: "2026-03", avgRating: 4.1, count: 61 },
  { month: "2026-04", avgRating: 4.1, count: 47 },
];

export const mockStatsByLocationId: Record<string, MonthlyStat[]> = {
  loc_1: loc1,
  loc_2: loc2,
  loc_3: loc3,
};

