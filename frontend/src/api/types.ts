export type LocationDto = {
  id: string;
  name: string;
  googlePlaceId: string | null;
  address: string;
  googleUrl: string;
  currentRating: number;
  totalReviews: number;
};

export type LocationMonthlyStatDto = {
  month: string; // YYYY-MM
  avgRating: number;
  count: number;
};

