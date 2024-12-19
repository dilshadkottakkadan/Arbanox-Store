import dotenv from 'dotenv';
import mongoose from "mongoose";

dotenv.config();


mongoose.connect(process.env.MONGO_DB_URL || '',{
    autoIndex:true
})

export const db = mongoose.connection