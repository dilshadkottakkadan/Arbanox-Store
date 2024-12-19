import { NextFunction, Request, Response } from "express";
import workerpool from 'workerpool';
import { AnalyseReviews, GenerateTags } from "./analysis.controller";

export function StartScrap(req: Request, res: Response, next: NextFunction){
    try {
        console.time('scraping-time')
        var counter = 0;
        var terminatedWorkers: (string | undefined)[] = [];
        let process: Array<any> = req.body ?? []
        let request_id: any;
        var pool = workerpool.pool(__dirname + '/workerpool/scraping', {
            workerType: 'process',
            maxWorkers: 1,
            onCreateWorker: (opts) => {
                return {
                    ...opts,
                    forkOpts: {
                        ...opts.forkOpts,
                        env: {
                            UNIQUE_WORKER_ID: `worker_id_${counter++}`
                        }
                    }
                }
            },
            onTerminateWorker: (opts) => {
                console.log('worker terminated - id:',opts.forkOpts?.env?.UNIQUE_WORKER_ID)
                terminatedWorkers.push(opts.forkOpts?.env?.UNIQUE_WORKER_ID);
            }
        })
        
        if (process.length) {
            try {
                const promises = process.map((pr, i) => {
                    request_id = pr.request_id
                    return pr.urlCombinations.map((url: any, index: number) => {
                        return pool.exec('ScrapingWorker', [{ data: { url: url, sleeptime: 0, process: pr, islastProcess: false } }])
                    })
                }).flat(1)
                res.send({
                    status: "success", message: "We are currently processing your data extraction request. Due to the large volume of data, this process may take more than 30 minutes to complete. Rest assured, our system is working diligently in the background to gather insights from the provided URLs. Thank you for your patience and understanding.", data: {
                        request_id: request_id
                    }
                })
                console.log('waiting for promises to get finished - scraping')
                Promise.allSettled(promises).then((results)=>{
                    console.timeEnd('scraping-time')
                    results.forEach(result => {
                        if (result.status === 'fulfilled') {
                            // console.log('fulfilled process')
                        }
                        else {
                            console.log('rejected some promise', result.reason)
                        }
                    })
                    if (results) {
                        pool.terminate()
                        console.time('tag-generation')
                        async function processTags() {
                            for (const proc of process) {
                                await GenerateTags(proc, request_id);
                            }
                        }
                        async function analysisReview() {
                            for (const proc of process) {
                                await AnalyseReviews(proc);
                            }
                        }
                        processTags().then(async() => {
                            console.timeEnd('tag-generation')
                            console.log('All processes completed.');
                            console.time('analysis-review')
                            await analysisReview()
                            console.timeEnd('analysis-review')
                        }).catch((error) => {
                            console.error('Error:', error);
                        });
                        
                    }
                }).catch(err=>{
                    console.error(err)
                })
            } catch (error) {
                console.error('Error:', error);
            } 
        }
        else{
            res.send({ status: "failed", message: "No request for process" })
        }
    } catch (error) {
        console.error(error)
    }
}

export function ProductDetailScraping(req: Request, res: Response, next: NextFunction){
    try {
        
    } catch (error) {
        console.error(error)
    }
}