import dotenv from "dotenv";
import mongoose from "mongoose";
import { LocationModel } from "../src/models/Location.ts";
import { ReviewModel } from "../src/models/Review.ts";
import { ApifyClient } from "../src/services/apify.ts";
import type { ApifyReview } from "../src/services/apify.ts";

dotenv.config();

function getInputUrls(): string[] {
  const argvUrls = process.argv.slice(2).filter(Boolean);
  if (argvUrls.length) return argvUrls;

  const env = process.env.GOOGLE_MAPS_URLS ?? "";
  return env
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function pickGoogleReviewId(r: ApifyReview): string | null {
  // Apify returns reviewId as the unique identifier
  if (r.reviewId) return String(r.reviewId);
  // Fallback to reviewUrl if available
  if (r.reviewUrl) return String(r.reviewUrl);
  return null;
}

export async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");

  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) throw new Error("Missing APIFY_API_KEY");

  const urls = getInputUrls();
  if (!urls.length) {
    throw new Error(
      "No URLs provided. Pass Google Maps URLs as CLI args or set GOOGLE_MAPS_URLS (newline-separated)."
    );
  }

  const reviewsLimit = Number(process.env.APIFY_REVIEWS_LIMIT ?? "200");
  const apify = new ApifyClient({
    apiKey,
    actorId: process.env.APIFY_ACTOR_ID,
  });

  await mongoose.connect(mongoUri);

  for (const googleUrl of urls) {
    // eslint-disable-next-line no-console
    console.log(`Fetching reviews for ${googleUrl}`);

    const reviews = await apify.fetchGoogleMapsReviews({
      query: googleUrl,
      reviewsLimit: Number.isFinite(reviewsLimit) ? reviewsLimit : 200,
      sort: "newest",
    });

    if (!reviews || reviews.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`No reviews returned for ${googleUrl}`);
      continue;
    }

    // Extract place info from first review (all reviews from same place have same place data)
    const firstReview = reviews[0];
    const locationName = firstReview.title ?? googleUrl;
    const locationRating = typeof firstReview.totalScore === "number" ? firstReview.totalScore : 0;
    const totalReviewCount = typeof firstReview.reviewsCount === "number" ? firstReview.reviewsCount : 0;

    const location = await LocationModel.findOneAndUpdate(
      { googleUrl },
      {
        $set: {
          name: locationName,
          address: "", // Apify doesn't return address in review format
          googleUrl,
          googlePlaceId: firstReview.placeId ?? null,
          currentRating: locationRating,
          totalReviews: totalReviewCount,
        },
      },
      { upsert: true, new: true }
    );

    // eslint-disable-next-line no-console
    console.log(`Upserting ${reviews.length} reviews for location ${location.name}`);

    for (const r of reviews) {
      const googleReviewId = pickGoogleReviewId(r);
      if (!googleReviewId) continue;

      // Parse published date - Apify provides publishedAtDate in ISO format
      let publishedAt: Date | null = null;
      if (r.publishedAtDate) {
        publishedAt = new Date(r.publishedAtDate);
      } else if (r.publishAt) {
        // Fallback to publishAt if available
        publishedAt = new Date(r.publishAt);
      }

      if (!publishedAt || isNaN(publishedAt.getTime())) continue;

      const rating = r.stars ?? r.rating;
      if (rating == null) continue;

      await ReviewModel.findOneAndUpdate(
        { googleReviewId },
        {
          $set: {
            locationId: location._id,
            googleReviewId,
            author: r.name ?? "Unknown",
            rating,
            text: r.text ?? "",
            publishedAt,
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

