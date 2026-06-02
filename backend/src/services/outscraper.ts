type OutscraperPlaceResult = {
  name?: string;
  full_address?: string;
  rating?: number;
  reviews?: number;
  location_link?: string;
  google_id?: string;
  place_id?: string;
  reviews_data?: OutscraperReview[];
};

type OutscraperReview = {
  review_id?: string;
  review_link?: string;
  review_rating?: number;
  rating?: number;
  review_text?: string;
  author_title?: string;
  author_id?: string;
  review_timestamp?: number; // unix seconds
  review_datetime_utc?: string; // "MM/DD/YYYY HH:mm:ss" (UTC)
  google_id?: string;
};

type OutscraperResponse = {
  id?: string;
  status?: string;
  data?: OutscraperPlaceResult[];
  error?: boolean;
  errorMessage?: string;
};

export class OutscraperClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(opts: { apiKey: string; baseUrl?: string }) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? "https://api.outscraper.cloud";
  }

  async fetchGoogleMapsReviews(params: {
    query: string;
    reviewsLimit?: number; // 0 = unlimited (may be slow)
    async?: boolean; // default false for importer simplicity
    sort?: "most_relevant" | "newest" | "highest_rating" | "lowest_rating";
  }): Promise<OutscraperPlaceResult[]> {
    const url = new URL("/google-maps-reviews", this.baseUrl);
    url.searchParams.set("query", params.query);
    if (params.reviewsLimit != null) url.searchParams.set("reviewsLimit", String(params.reviewsLimit));
    url.searchParams.set("async", String(params.async ?? false));
    if (params.sort) url.searchParams.set("sort", params.sort);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY": this.apiKey,
        Accept: "application/json",
      },
    });

    const json = (await res.json()) as OutscraperResponse;

    if (!res.ok || json.error) {
      const msg = json?.errorMessage || `Outscraper error: ${res.status} ${res.statusText}`;
      throw new Error(msg);
    }

    return json.data ?? [];
  }
}

export type { OutscraperPlaceResult, OutscraperReview };

