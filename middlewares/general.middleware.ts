import { timeStamp } from "console";
import { randomUUID } from "crypto";
import { _Request } from "../db/models/request.model";
import { NextFunction, Request, Response } from "express";


/**
 * Saving Request Collection to DB, contains the number process and the requestid
 * @param req
 * @param res
 * @param next
 */
export function RequestProcessRelation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let urls: Array<string> = req.body?.url || [];
  let userID: string = req.body?.user_id;
  if (urls.length) {
    let requestID = randomUUID();
    let process: any = [];
    urls.forEach((url: any) => {
      let processid = randomUUID();
      process.push({
        request_id: requestID,
        process_id: processid,
        product_url: url.url,
        user_id: userID,
        isProcessCompleted: false,
        isAnalyseCompleted: false,
      });
      _Request.create({
        request_id: requestID,
        process_id: processid,
        product_url: url.url,
        product_price: url.price,
        user_id: userID,
        isProcessCompleted: false,
        isAnalyseCompleted: false,
        createdTime: new Date(),
      });
    });
    req.body = process;
    next();
  } else {
    res.sendStatus(400);
  }
}

export function IsAnalysecompleted(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let reques_id = req.query.request_id;
  if (reques_id) {
    _Request
      .find({
        request_id: reques_id,
        isAnalyseCompleted: true,
      })
      .then((docu) => {
        if (docu.length) {
          next();
        } else {
          res.send({ status: "notCompleted" });
        }
      });
  } else {
    res.sendStatus(400).send({
      status: "failed",
      message: "Request ID is missing",
    });
  }
}

/**
 * Generationg parameters combinations
 * eg [{
    reviewerType: 'vp_only_reviews', 
    sortBy: 'recent',
    ilterByStar: 'two_star',
    formatType: 'all_formats',
    mediaType: 'media_reviews_only'
   }]
 * @param options : fiter options of the parameter
 */
export function paramsCombination(req: Request, res: Response, next: NextFunction) {
  let options = _options
  console.time('paramsCombination Execution Time');
  const combinations: { reviewerType: string; sortBy: string; filterByStar: string; formatType: string; mediaType: string; }[] = [];
  options.reviewerType.forEach((reviewerType: any) => {
    options.sortBy.forEach((sortBy: any) => {
      options.filterByStar.forEach((filterByStar: any) => {
        options.formatType.forEach((formatType: any) => {
          options.mediaType.forEach((mediaType: any) => {
            combinations.push({
              reviewerType,
              sortBy,
              filterByStar,
              formatType,
              mediaType
            });
          });
        });
      });
    });
  });
  console.timeEnd('paramsCombination Execution Time');
  req['paramsCombination'] = combinations;
  return next()
}

/**
* Generating different combinations of product review urls like : 
* https://amazonproductlink/reviews?filterByStar=one_star :gives reviews with one star
* @param url string
*/
export function generateAllUrlCombinations(req: Request, res: Response, next: NextFunction) {
  let paramscombinations: Array<Object> = req['paramsCombination'] ?? []
  let process: Array<any> = req.body ?? []
  console.time('URL combination Execution Time');
  process.forEach((process, i) => {
    let url = process.product_url
    let urls = []
    for (let i = 0; i < paramscombinations.length; i++) {
      const urlObj = new URL(url);
      const searchParams = urlObj.searchParams;
      Object.entries(paramscombinations[i])?.forEach(([key, value]) => {
        searchParams.set(key, value)
      })
      urlObj.search = searchParams.toString();
      urls.push(urlObj.href)
    }
    req.body[i] = { ...req.body[i], urlCombinations: urls }

  })
  console.timeEnd('URL combination Execution Time');
  return next()
}



declare global {
  namespace Express {
    interface Request {
      paramsCombination?: any;
      allurls?: any
    }
  }
}

const _options = {
  "reviewerType": [
    "all_reviews"
  ],
  "sortBy": [
    "recent"
  ],
  "filterByStar": [
    "all_stars",
    "five_star",
    "four_star",
    "three_star",
    "two_star",
    "one_star",
    "positive",
    "critical"
  ],
  "formatType": [
    "all_formats"
  ],
  "mediaType": [
    "all_contents"
  ]
}
