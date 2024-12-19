import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    request_id: { type: String },
    process_id: { type: String },
    nama: { type: String },
    profileUrl: { type: String },
    rating: { type: String },
    title: { type: String },
    dateText: { type: String },
    verifiedPurchase: { type: Boolean },
    reviewText: { type: String },
    productName: { type: String },
    totalRating:{ type: String },
    globalRating: {type: String},
    brand:{ type: String },
    analysis: {
        sentiment: { type: String },
        tone: { type: String },
        language: { type: String },
        pros: { type: [String] },
        cons: { type: [String] },
        rating: { type:Number },
        positivePricingLabels: { type: [String] },
        negativePricingLabels: { type: [String] },
        positiveDeliveryLabels: { type: [String] },
        negativeDeliveryLabels: { type: [String] },
        postiveProductFeatureLabels: { type: [String] },
        negativeProductFeatureLabels: { type: [String] },
        positivePackagingLabels: { type: [String] },
        negativePackagingLabels: { type: [String] }
    }
})

reviewSchema.index({
    request_id:1,
    process_id:1,
    name: 1,
    profileUrl: 1,
    rating: 1,
    title: 1,
    dateText: 1,
    verifiedPurchase: 1,
    reviewText: 1
}, {
    unique: true
})

export const Review = mongoose.model('Review', reviewSchema);

