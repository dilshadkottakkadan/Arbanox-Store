import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import http from 'http';
import { db } from './db/index';
import Scraprouter from './routes/scrap';
import { Products } from './db/models/product.model';
import { Review } from './db/models/review.model';
import { Tags } from './db/models/tag.model';
import { _Request } from './db/models/request.model';

dotenv.config();

const app = express()
app.use(cors())
const server = http.createServer(app)
const port = process.env.PORT;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB db database');
});


async function syncDatabase(){
  try {
    await Products.syncIndexes()
    await Review.syncIndexes()
    await Tags.syncIndexes()
    await _Request.syncIndexes()
  } catch (error) {
    console.error(error)
  }
}

syncDatabase();

app.use(express.json());
app.use(express.raw());

app.use('/scrap', Scraprouter)

server.listen(port, () => {
  console.log(`review-insights-main app listening on port ${port}`)
})