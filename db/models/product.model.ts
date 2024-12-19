import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
    label:{ type: String },
    count: { type: Number }
})

const productSchema = new mongoose.Schema({
    productId: { type: String, unique:true },
    orgID: { type: String },
    name: { type: String },
    brand: { type: String },
    price: { type: String },
    imgSrc: { type: String },
    rating: { type: String },
    totalReviews: { type: String },
    scrapedReviews: { type: Number },
    updatedTime:{type:Date},
    positiveReviews: [labelSchema],
    negativeReviews:[labelSchema],
    positiveDeliveryLabels:[labelSchema],
    negativeDeliveryLabels:[labelSchema],
    postivePricingLabels:[labelSchema],
    negativePricingLabels:[labelSchema],
    postivePackagingLabels:[labelSchema],
    negativePackagingLabels:[labelSchema],
    positiveProductfeatureLabels:[labelSchema],
    negativeProductfeatureLabels:[labelSchema]
})

export const Products = mongoose.model('Products', productSchema);