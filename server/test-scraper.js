
import { scrapeGradesHTTP } from './scraper-http.js';

async function test() {
    try {
        console.log('Starting scraper test...');
        const username = process.env.HAC_USERNAME || 'demo';
        const password = process.env.HAC_PASSWORD || 'demo';
        const data = await scrapeGradesHTTP(username, password);
        console.log('Scraper finished.');
        // console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
