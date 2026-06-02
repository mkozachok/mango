import { Schema, model, type InferSchemaType, type Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true
    },
    googleReviewId: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    text: { type: String, required: true, default: "" },
    publishedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

ReviewSchema.index({ googleReviewId: 1 }, { unique: true });
ReviewSchema.index({ locationId: 1, publishedAt: 1 });

export type Review = InferSchemaType<typeof ReviewSchema> & {
  locationId: Types.ObjectId;
};
export const ReviewModel = model("Review", ReviewSchema);

