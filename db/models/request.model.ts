import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    request_id: { type: String },
    process_id: { type: String },
    product_url: { type: String },
    product_price: { type: String },
    user_id: { type: String },
    isProcessCompleted: { type: Boolean },
    isAnalyseCompleted:{ type: Boolean },
    createdTime: { type:Date }
})

export const _Request = mongoose.model('Request', requestSchema);

