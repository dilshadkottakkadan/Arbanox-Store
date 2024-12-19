import { Browser, chromium } from 'playwright';
import workerpool from 'workerpool';
import { db } from '../../db/index';

async function ScrapingWorker(event: any){
    try {
        let browser: Browser | null = null
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ 
            bypassCSP: true,
            extraHTTPHeaders:{
            userAgent: userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)]},
        });
        
        await context.addCookies([...cookies])
        let allReviews:any = [];
        let nextPage = event.data.url;
        while (nextPage) {
            const page = await context.newPage();
            await page.goto(nextPage);
            const reviews = await page.evaluate(() => {
                const reviewELs = document.querySelectorAll('[data-hook="review"]') 
                const nextPageUrl = document.querySelector('.a-pagination .a-last')?.querySelector('a')?.href ?? null
                let reviews: any[] = []
                if (reviewELs?.length) {
                    reviewELs?.forEach(el => {
                        reviews.push({
                            name: el.querySelector('.a-profile-name')?.textContent?.trim() ?? null,
                            //@ts-ignore
                            profileUrl: el?.querySelector('a[class*=a-profile]')?.href ?? null,
                            rating: el?.querySelector('[data-hook=review-star-rating]')?.textContent?.split(' ')?.[0] ?? null,
                            title: el?.querySelector('[data-hook=review-title]')?.querySelector(':scope>span:last-child')?.textContent?.trim() ?? null,
                            dateText: el?.querySelector('[data-hook=review-date]')?.textContent?.trim(),
                            verifiedPurchase: el?.querySelector('[data-hook="avp-badge"]')?.textContent?.trim() == 'Verified Purchase' ? true : false,
                            reviewText: el?.querySelector('[data-hook=review-body] > span')?.textContent?.trim() ?? null,
                            productName:document.querySelector('[data-hook="product-link"]')?.textContent?.trim()?? null,
                            totalRating:document.querySelector('[data-hook="rating-out-of-text"]')?.textContent?.trim() ?? null,
                            globalRating:document.querySelector('[data-hook="total-review-count"]> span')?.textContent?.trim() ?? null,
                            brand:document.querySelector('[data-hook="cr-product-byline"]> span>a')?.textContent?.trim() ?? null
                        })
                    })
                }
                return { reviews: reviews, nextpage: nextPageUrl }
            })
            allReviews.push(...reviews.reviews);
            nextPage = reviews.nextpage;
            // console.log('nexpage')
            if(allReviews.length){
                allReviews.forEach(async(rev:any,i:any)=>{
                    await db.collection('reviews').createIndex({
                        request_id:1,
                        process_id:1,
                        name: 1,
                        profileUrl: 1,
                        rating: 1,
                        title: 1,
                        dateText: 1,
                        verifiedPurchase: 1,
                        reviewText: 1
                    },{unique:true})
                    await db.collection('reviews').insertOne({...rev,...{
                        request_id:event.data.process.request_id,
                        process_id:event.data.process.process_id
                        }}).then(()=>{
                        }).catch(err => {
                            if (err.code === 11000) {
                                // console.error('Duplicate key error');
                                // Handle the duplicate key error if needed, or simply ignore it
                            } else {
                                console.error('Error while saving data:', err);
                                // Handle other errors
                            }
                        })
                })
            }
            if (nextPage == null) {
                // console.log('no next pages')
                await browser.close()
            } 
        }
        return event   
    } catch (error) {
        console.error(error)
    }
}

workerpool.worker({
    ScrapingWorker:ScrapingWorker
})

const userAgentStrings = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
];

const cookies:Array<{
    name: string;
    value: string;
    /**
     * Domain and path are required. For the cookie to apply to all subdomains as well, prefix domain with a dot, like
     * this: ".example.com"
     */
    domain: string;
    /**
     * Domain and path are required
     */
    path: string;
    /**
     * Unix time in seconds.
     */
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    /**
     * sameSite flag
     */
    sameSite: "Strict"|"Lax"|"None";
  }> = [
    {
        "name": "at-acbin",
        "value": "Atza|IwEBIOVQRwszce49-h0AVsJy2BjRo3qmGZdf3dP_2v_3s69maChf9AknSdL3XD-0NvJIN-gjAW4y9fGVmltdOQZ4k5ky1OOhaVMM_mjouM64bhFPw5RiB2J7FQTTURfGZKokv2oP4TNFeoYx52Tm4UimvVZcUmnI8bhwsWZ-02Y6ZqkQgJQOVRXtK948hceBSOyoFjMOpFI8IWKA9cmpF65DyeGwi0tutNgYG_T0WiVWgvLDSw",
        "domain": ".amazon.in",
        "path": "/",
        "expires": 1721270313.343102,
        "httpOnly": true,
        "secure": true,
        "sameSite": "None"
    },
    {
        "domain": ".amazon.in",
        "expires": 1721270313.683923,
        "httpOnly": false,
        "name": "i18n-prefs",
        "path": "/",
        "sameSite": "None",
        "secure": false,
        "value": "INR"
    },
    {
        "domain": ".amazon.in",
        "expires": 1721270313.34316,
        "httpOnly": true,
        "name": "sess-at-acbin",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "\"o7exsi+fYw0JzL4kFUT/E2wUfMlMgG+iguApIA64y3g=\""
    },
    {
        "domain": ".amazon.in",
        "expires": 1724294318.181329,
        "httpOnly": false,
        "name": "session-id",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "261-4395934-8899963"
    },
    {
        "domain": ".amazon.in",
        "expires": 1724294318.181409,
        "httpOnly": false,
        "name": "session-id-time",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "2082787201l"
    },
    {
        "domain": ".amazon.in",
        "expires": 1724294318.181457,
        "httpOnly": true,
        "name": "session-token",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "qSP8RrEGj7LUU/76o1H2QBC/JpiuivqQs7NFTZ9e/FMdLWS/CtuXlUnS2t1+oJ9dYGqRkC2S2evJvNLkHh1bsuBGA8seksk6tIJ+KeRZeaN3XGAdR4ycHDaDtnNECvoGhP+8VgFj1qfOOTqxCxsZTtK7vTA1xgHbdEM0gQ2vv1iLQUv9QOeF9/TuLlyjUB19bO/IdDJniT2nbZVFSuqcF+7B4L5NSw1MyJnqI5E7WIaoNmnSme5HiIEjI95EMGVT"
    },
    {
        "domain": ".amazon.in",
        "expires": 1721270313.343184,
        "httpOnly": true,
        "name": "sst-acbin",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "Sst1|PQENjjm6Fw-wKk3xb54-c5BiCcEbJJUz5sazuMX99cMqkx75qQAQQdyvbeq242RoXYnje0uE3D4H3H9OQBqYuwnPKPvbSQvDF5mv1_pagxB1bAZSrDw-OTPGsHBHEhOKZv8GR9mhaTM1Q4CZpdOHEyp7USatDAYKHErDMuTWjbOxTZMU8iMAvPD29oXP5BnSKKT_qImVmClU7zmoawc2pEXM4IMDegkyXr3F14B6FbL5oYOO18Mb-zHWWHA-QkeU2LRT2EajcyFdhFYGjueeUOYCp7Qg2P9tYpGgdsFSTshvonQ"
    },
    {
        "domain": ".amazon.in",
        "expires": 1721270313.683825,
        "httpOnly": false,
        "name": "ubid-acbin",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "260-6113969-2541566"
    },
    {
        "domain": ".amazon.in",
        "expires": 1721270313.683908,
        "httpOnly": false,
        "name": "x-acbin",
        "path": "/",
        "sameSite": "None",
        "secure": true,
        "value": "\"?MBOz10mKZDZWFfLlhbmfeREQWWomZ0uRmLrB3SXKTW13Un7pX6naiV2bEH4m?AT\""
    },
    {
        "domain": "www.amazon.in",
        "expires": 1719974314,
        "httpOnly": false,
        "name": "csm-hit",
        "path": "/",
        "sameSite": "None",
        "secure": false,
        "value": "tb:s-R9V52H2FWTK055V0C1D2|1689734313912&t:1689734314430&adb:adblk_no"
    }
]
