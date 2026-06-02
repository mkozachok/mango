export type ApifyReview = {
  reviewId?: string;
  reviewUrl?: string;
  rating?: number;
  stars?: number;
  text?: string;
  name?: string; // reviewer name
  authorId?: string;
  publishedAt?: string;
  publishedAtDate?: string;
  publishAt?: string;
  responseFromOwnerText?: string;
  responseFromOwnerDate?: string;
  reviewImageUrls?: string[];
  placeId?: string;
  title?: string;
  totalScore?: number;
  reviewsCount?: number;
};

export class ApifyClient {
  private readonly apiKey: string;
  private readonly actorId: string;

  constructor(opts: { apiKey: string; actorId?: string }) {
    this.apiKey = opts.apiKey;
    this.actorId = opts.actorId ?? "compass/google-maps-reviews-scraper";
  }

  async fetchGoogleMapsReviews(params: {
    query: string;
    reviewsLimit?: number;
    async?: boolean;
    sort?: "newest" | "mostRelevant" | "highestRanking" | "lowestRanking";
  }): Promise<ApifyReview[]> {
    const url = new URL(
      "/v2/acts/compass~google-maps-reviews-scraper/run-sync-get-dataset-items",
      "https://api.apify.com"
    );
    url.searchParams.set("token", this.apiKey);

    const requestBody = {
      startUrls: [{ url: params.query }],
      maxReviews: params.reviewsLimit ?? 200,
      reviewsSort: params.sort ?? "newest",
      language: "en",
      personalData: true,
    };

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Apify error: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const items = (await res.json()) as ApifyReview[];
    return items || [];
  }
}
