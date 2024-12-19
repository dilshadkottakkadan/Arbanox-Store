import { Browser, chromium } from 'playwright';

const Scraper = async () => {
    let browser: Browser | null = null;
    try {

        browser = await chromium.launch({ headless: false });
        const context = await browser.newContext({
            bypassCSP: true,
            extraHTTPHeaders: {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
            },
        });


        const cookiesWithExpires = cookies.map(cookie => ({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path || "/",
            expires: cookie.expirationDate ? Math.floor(cookie.expirationDate) : undefined,
            httpOnly: cookie.httpOnly || false,
            secure: cookie.secure || false,
            sameSite: cookie.sameSite === "unspecified" ? undefined : cookie.sameSite,
        }));

        console.log("Adding cookies:", cookiesWithExpires);
        await context.addCookies(cookiesWithExpires);


        const page = await context.newPage();
        await page.goto(
            'https://www.amazon.in/dp/B0CN9RY9DC/ref=syn_sb_onsite_desktop_0?ie=UTF8&pd_rd_plhdr=t&aref=fhyQLxZDOj&th=1'
        );


        await page.locator('#averageCustomerReviews_feature_div').getByRole('button', { name: '3.6 3.6 out of 5 stars' }).click();
        await page.getByRole('link', { name: 'See customer reviews' }).click();
        await page.getByRole('link', { name: 'See more reviews' }).click();
    } catch (error) {
        console.error("An error occurred:", error);
    } finally {

        if (browser) {
            await browser.close();
        }
    }
};


Scraper();

const cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    /**
     * Optional properties:
     * Some cookies in your array have these properties, but they might not be present in all objects.
     */
    expirationDate?: number; // Changed from `expires` to match the input structure
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None" | "unspecified"; // Include "unspecified" to match the data
    hostOnly?: boolean;
    session?: boolean;
    storeId?: string;
    index?: number;
    isSearch?: boolean;
}> = [
        {
            "domain": ".amazon.in",
            "expirationDate": 1769078732.006777,
            "hostOnly": false,
            "httpOnly": false,
            "name": "session-id",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "257-1902225-9355542",
            "index": 0,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1763093663.749446,
            "hostOnly": false,
            "httpOnly": false,
            "name": "ubid-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "260-6381952-5354147",
            "index": 1,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1763093663.749538,
            "hostOnly": false,
            "httpOnly": false,
            "name": "x-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "\"JLkoPEdgz2diaAoRfpDJqh?zkT3?xSgGXwaLh9Ckwh@g8eGc2EvlyxAuFR7ooBh2\"",
            "index": 2,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1742979577.720783,
            "hostOnly": false,
            "httpOnly": true,
            "name": "at-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "Atza|IwEBIEJ9O5--IfO_KhgtHxCB1qtN628K3DEKARjsUrM-sue6H_auPacQ6ZEgacrrxUnz4o9p9Of28PtZx7jdWQf1wbNxmImGFekv_mzdnxabP9_akKq6C2gEbYUmXt6pm213YmLTLXZlGqxg81DFdBox2H3L0RGHpCHLtgMirKlvnin_Tabzlyhof_draNylfNB2JLs3IiQP7rWF6iZX7z7Fwgu6zTPkfI_wlJLWCkjYbPBeX1uOc7vskpw1qQcNxSA_fV8",
            "index": 3,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1742979577.720886,
            "hostOnly": false,
            "httpOnly": true,
            "name": "sess-at-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "\"LKmzQy9ajOFu/39Le3hla7lYAYLlr3Hca7pY+1Teeds=\"",
            "index": 4,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1742979577.72094,
            "hostOnly": false,
            "httpOnly": true,
            "name": "sst-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "Sst1|PQEpPAt4BLiIuDSIf5kWmFwRCS0b_uy-rL4nGjX4cUZ2_wdTSjeci7dI2dXdb4oD6u9d_o3hs2FmtHSntKOadKlVnyzIZktv-gZZSxWiEhtszs64f41D0zuhgKTWMIICyuszE8db6rowDH0RVq5UeVEuwIFmEyhF_-IEt8sVek3U5kTrH334rlwUcBXEDKiM1StEWfxMMrUVDM_jC6uYxJTNhknM0xlRfHOum7bAgDH9PSZhKUvf_2DpfV6YexcNrxRCpf85JLeTrcSK4TL-15VJSJY3Z095uqHsXT8ZikP2wd4",
            "index": 5,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1769077968.895505,
            "hostOnly": false,
            "httpOnly": false,
            "name": "lc-acbin",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "en_IN",
            "index": 6,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1763093663.749564,
            "hostOnly": false,
            "httpOnly": false,
            "name": "i18n-prefs",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "INR",
            "index": 7,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1769078732.006938,
            "hostOnly": false,
            "httpOnly": false,
            "name": "session-id-time",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "2082787201l",
            "index": 8,
            "isSearch": false
        },
        {
            "domain": ".amazon.in",
            "expirationDate": 1766055674.516155,
            "hostOnly": false,
            "httpOnly": false,
            "name": "session-token",
            "path": "/",
            "sameSite": "unspecified",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "pbsnHlWjaO1wWxDeaWhHFdEnZCRt9+mFY5J6jgOtcBs/zahKU7EqN8iC5vZ74OYUJb7zddCQ8yvgP/4F6r1g8jTqxhRR6k55yDD3f9BF8YtnufkkD3FNKvUartPlJbjFAb4UT/xwhq58xXB5pzJ8ky619My5auA+66y2LxYLS219VVJc8ZhF/IcYECv8cce28TcYTWMVxUNrAMPF7gFKcLcbcTVTBCl6R5mg7C/9RttVC23oWYfNF5PfF6M7VvHKWg/aB940UwMZkViK0EKzi2S0WxUOLRh4CR9viT19ju7aEicwEw0i3c6h5/+nMHhXEm+E8rOUGGPSY3esxCG676F7ftARo6RgM+p2mT7rANIzZlfW77gjLStw9aJ2ObMB",
            "index": 9,
            "isSearch": false
        },
        {
            "domain": "www.amazon.in",
            "expirationDate": 1764761715,
            "hostOnly": true,
            "httpOnly": false,
            "name": "csm-hit",
            "path": "/",
            "sameSite": "unspecified",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "tb:2DY26EFRDM7WM4JAA3CT+s-TY2PD3VB7JF4ZC3NJVVJ|1734521715300&t:1734521715300&adb:adblk_no",
            "index": 10,
            "isSearch": false

        }
    ]