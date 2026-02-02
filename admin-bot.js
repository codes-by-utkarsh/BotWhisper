require('dotenv').config();
const puppeteer = require('puppeteer');

const args = process.argv.slice(2);
const ticketId = args[0];

if (!ticketId) {
    console.error('Usage: node admin-bot.js <ticketId>');
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    const page = await browser.newPage();

    const url = `http://localhost:3000/ticket-view/${ticketId}`;
    console.log(`[Bot] Visiting ${url}`);

    try {
        await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

        await page.setCookie({
            name: 'session_id',
            value: process.env.ADMIN_COOKIE,
            domain: 'localhost',
            path: '/',
            httpOnly: false,
            sameSite: 'Lax'
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        console.log('[Bot] Page loaded');

        const cookies = await page.cookies();
        console.log('[Bot] Cookies:', cookies.map(c => `${c.name}=${c.value}`).join('; '));

        await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
        console.error(`[Bot] Error: ${err.message}`);
    }

    await browser.close();
    console.log('[Bot] Finished');
})();
