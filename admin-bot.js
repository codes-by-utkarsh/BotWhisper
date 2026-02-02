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
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });
    const page = await browser.newPage();

    // Set Admin Cookie
    await page.setCookie({
        name: 'session_id',
        value: 'Sup3rS3cr3tAdm1nC00k1e_DoNotShare',
        domain: 'localhost',
        path: '/',
        httpOnly: false
    });

    const url = `http://localhost:3000/ticket-view/${ticketId}`;
    console.log(`[Bot] Visiting ${url}`);

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 5000 });
        console.log('[Bot] Page loaded');
        // Wait a bit for any XSS to trigger
        await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
        console.error(`[Bot] Error visiting page: ${err.message}`);
    }

    await browser.close();
    console.log('[Bot] Finished');
})();
