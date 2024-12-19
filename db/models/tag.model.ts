import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    positivePricingLabels: { type: [String] },
    negativePricingLabels: { type: [String] },
    positiveDeliveryLabels: { type: [String] },
    negativeDeliveryLabels: { type: [String] },
    postiveProductFeatureLabels: { type: [String] },
    negativeProductFeatureLabels: { type: [String] },
    positivePackagingLabels: { type: [String] },
    negativePackagingLabels: { type: [String] },
    request_id: { type: String },
    process_id: { type: String, unique:true },
})

export const Tags = mongoose.model('Tags', tagSchema);

