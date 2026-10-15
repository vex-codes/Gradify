import { scrapeGradesHTTP } from './scraper-http.js';

async function run() {
    console.log('Starting standalone scrape...');
    try {
        const username = process.env.HAC_USERNAME || 'demo';
        const password = process.env.HAC_PASSWORD || 'demo';
        const result = await scrapeGradesHTTP(username, password);
        console.log('Scrape successful!');
        console.log('Student:', result.studentName);
        console.log('Attendance Title:', result.attendance?.title || 'No title');
        console.log('Attendance Records:', Array.isArray(result.attendance) ? result.attendance.length : 'Not an array');
    } catch (error) {
        console.error('Scrape failed:', error);
    }
}

run();
