import { RequestProcessRelation, generateAllUrlCombinations, paramsCombination } from '../middlewares/general.middleware';
import { StartScrap } from '../controllers/scrap.controller';
import express, { Router } from 'express';

const Scraprouter: Router = express.Router();

Scraprouter.post('/', RequestProcessRelation,paramsCombination,generateAllUrlCombinations,StartScrap)
Scraprouter.post('/Arbanox');
export default Scraprouter;