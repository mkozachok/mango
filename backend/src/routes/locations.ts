import { Router } from "express";
import mongoose from "mongoose";
import { LocationModel } from "../models/Location";
import { ReviewModel } from "../models/Review";

export const locationsRouter = Router();

// GET /api/locations
// Returns locations with stored summary stats (currentRating, totalReviews)
locationsRouter.get("/locations", async (_req, res, next) => {
  try {
    const locations = await LocationModel.find({})
      .sort({ name: 1 })
      .select({ __v: 0 })
      .lean();

    res.json(
      locations.map((l) => ({
        id: String(l._id),
        name: l.name,
        googlePlaceId: l.googlePlaceId ?? null,
        address: l.address,
        googleUrl: l.googleUrl,
        currentRating: l.currentRating,
        totalReviews: l.totalReviews,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/locations/:id/stats
// Returns monthly stats from reviews:
// Array<{ month: string, avgRating: number, count: number }>
locationsRouter.get("/locations/:id/stats", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid location id" });
      return;
    }

    const locationId = new mongoose.Types.ObjectId(id);

    const rows = await ReviewModel.aggregate<{
      month: string;
      avgRating: number;
      count: number;
    }>([
      { $match: { locationId } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$publishedAt" },
          },
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          avgRating: { $round: ["$avgRating", 3] },
          count: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

