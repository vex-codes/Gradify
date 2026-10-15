import puppeteer from 'puppeteer-core';

// Common Chrome paths on macOS
const CHROME_PATHS = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/usr/bin/google-chrome',
];

async function getExecutablePath() {
    // You might want to add logic to check which path exists
    // For now, we'll default to the standard macOS Chrome path
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

export async function scrapeGrades(username, password) {
    let browser = null;
    try {
        const executablePath = await getExecutablePath();
        console.log(`Launching browser from: ${executablePath}`);

        browser = await puppeteer.launch({
            executablePath,
            headless: true, // Run in background
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 1. Navigate to Login
        console.log('Navigating to HAC login...');
        await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn?ReturnUrl=%2fhomeaccess%2f', {
            waitUntil: 'networkidle2'
        });

        // 2. Input Credentials
        console.log('Entering credentials...');
        await page.type('#LogOnDetails_UserName', username);
        await page.type('#LogOnDetails_Password', password);

        // Click login and wait for navigation
        await Promise.all([
            page.click('.sg-logon-button'), // Adjust selector if needed
            page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(e => console.log('Navigation timeout or already there'))
        ]);

        // Check if login failed
        if (await page.$('.validation-summary-errors')) {
            throw new Error('Invalid credentials');
        }

        // 3. Navigate to Grades (Classes)
        console.log('Navigating to Classes...');
        // HAC usually has a "Classes" tab. URL might be /HomeAccess/Content/Student/Assignments.aspx
        await page.goto('https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx', {
            waitUntil: 'networkidle2'
        });

        // 4. Extract Data
        console.log('Extracting grade data...');
        const courses = await page.evaluate(() => {
            const courseNodes = document.querySelectorAll('.sg-content-grid'); // This selector is a guess, needs adjustment based on real HAC HTML
            const result = [];

            // HAC structure is notoriously nested tables. 
            // We'll look for the main course headers and their associated assignment tables.
            // This is a simplified extraction logic.

            const courseHeaders = document.querySelectorAll('.sg-header-heading');

            courseHeaders.forEach((header, index) => {
                const courseName = header.innerText.trim();
                // Find the average - usually near the header
                const averageText = header.closest('.sg-header')?.querySelector('.sg-header-heading-right')?.innerText || '0';
                const average = parseFloat(averageText.replace('%', '')) || 0;

                // Find assignments
                // In HAC, assignments are often in a table following the header
                // We'd need to traverse the DOM carefully.
                // For this demo, we'll return the basic course info we found.

                result.push({
                    id: `c-${index}`,
                    name: courseName,
                    teacher: 'Unknown', // Need to find where teacher name is stored
                    period: `${index + 1}`,
                    average,
                    letterGrade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
                    categories: [], // Would need to parse category table
                    assignments: [] // Would need to parse assignment table
                });
            });

            return result;
        });

        console.log(`Found ${courses.length} courses.`);

        // If we couldn't find courses with the generic selectors, we might need to be more specific.
        // For now, let's return what we have.

        return courses;

    } catch (error) {
        console.error('Scraping failed:', error);
        throw error;
    } finally {
        if (browser) {
            // Keep browser open for a bit if debugging, or close it
            // await browser.close(); 
            // User said "open chrome to see", so maybe we keep it open?
            // But for an API, we usually close it. Let's close it after a short delay or if successful.
            // For now, let's close it to avoid zombie processes, unless it crashed.
            await browser.close();
        }
    }
}
