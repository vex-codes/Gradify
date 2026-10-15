import express from 'express';
import cors from 'cors';
import { scrapeGradesHTTP } from './scraper-http.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory session storage (simplified for demo)
let activeSession = null;

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    try {
        console.log(`Attempting login for user: ${username}`);
        const data = await scrapeGradesHTTP(username, password);

        if (data) {
            // In a real app, we'd store a session token/cookie here
            activeSession = { username, timestamp: Date.now() };
            // data now contains { courses, transcript, attendance, studentName }
            res.json({ success: true, user: { name: data.studentName || 'Student', username }, data: data.courses, fullData: data });
        } else {
            res.status(401).json({ error: 'Login failed or no data found' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
