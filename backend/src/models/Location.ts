import { Schema, model, type InferSchemaType } from "mongoose";

const LocationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    googlePlaceId: { type: String, trim: true, default: null },
    address: { type: String, required: true, trim: true },
    googleUrl: { type: String, required: true, trim: true },
    currentRating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: true }
);

LocationSchema.index({ googleUrl: 1 }, { unique: true });
LocationSchema.index(
  { googlePlaceId: 1 },
  {
    unique: true,
    partialFilterExpression: { googlePlaceId: { $type: "string" } }
  }
);

export type Location = InferSchemaType<typeof LocationSchema>;
export const LocationModel = model("Location", LocationSchema);

