import axios from 'axios';
import * as cheerio from 'cheerio';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import qs from 'querystring';
import fs from 'fs';

export async function scrapeGradesHTTP(username, password) {
    // Mock Data for Demo User
    if ((username === 'demo' && password === 'demo') || (username === 'test' && password === 'test')) {
        console.log('Using MOCK DATA for demo user.');
        return getMockData();
    }

    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    const BASE_URL = 'https://accesscenter.roundrockisd.org/HomeAccess';
    const LOGIN_URL = `${BASE_URL}/Account/LogOn?ReturnUrl=%2fhomeaccess%2f`;
    const ASSIGNMENTS_URL = `${BASE_URL}/Content/Student/Assignments.aspx`;

    try {
        console.log('1. Fetching login page...');
        const loginPage = await client.get(LOGIN_URL);
        const $login = cheerio.load(loginPage.data);

        // Extract all hidden inputs
        const hiddenInputs = {};
        $login('input[type="hidden"]').each((i, el) => {
            const name = $login(el).attr('name');
            const value = $login(el).attr('value');
            if (name) {
                hiddenInputs[name] = value || '';
            }
        });

        console.log('Found hidden inputs:', Object.keys(hiddenInputs));

        console.log('2. Sending login request...');
        const loginData = {
            ...hiddenInputs,
            'LogOnDetails.UserName': username,
            'LogOnDetails.Password': password,
            'Database': '10' // Ensure this is still sent if it wasn't a hidden field, but usually it is.
        };

        // We need to send form-urlencoded data
        const loginResponse = await client.post(LOGIN_URL, qs.stringify(loginData), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': LOGIN_URL,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400 // Handle redirects manually if needed, but axios follows by default
        });

        // Check if we are redirected to home or still on login (validation error)
        if (loginResponse.request.res.responseUrl.includes('LogOn')) {
            // If URL is still LogOn, login failed
            console.error('Login failed: Still on login page.');
            // Try to parse error
            const $ = cheerio.load(loginResponse.data);
            const error = $('.validation-summary-errors').text().trim();
            throw new Error(error || 'Invalid credentials or login failed');
        }

        console.log('3. Fetching assignments...');
        const gradesResponse = await client.get(ASSIGNMENTS_URL);
        if (process.env.DEBUG_SCRAPER === 'true') {
            fs.writeFileSync('assignments_debug.html', gradesResponse.data);
        }
        // 3a. Fetch Student Name from Demographic Page
        console.log('3a. Fetching student details...');
        let studentName = 'Student';
        try {
            const demographicResponse = await client.get(`${BASE_URL}/Registration/Demographic`);
            const $demo = cheerio.load(demographicResponse.data);

            // Inspect the debug file provided: <span>Vedansh Kumar</span> exists.
            // Often it's in a header or specific class.
            // Let's search for "Student Name" label first.
            let foundName = '';

            // Strategy 1: Look for "Student Name:" label
            $demo('td, span, div, label').each((i, el) => {
                const text = $demo(el).text().trim();
                if (text.includes('Student Name:')) {
                    if (text.length > 15) {
                        foundName = text.replace('Student Name:', '').trim();
                        return false;
                    }
                }
            });

            // Strategy 2: Look for the specific element structure seen in debug (if Strategy 1 fails)
            // If we can't find label, look for the title?
            if (!foundName) {
                // Try looking for the "lblStudentName" id often used in HAC
                const idName = $demo('#plnStudentTree_lblStudentName').text().trim();
                if (idName) foundName = idName;
            }

            // Strategy 3: Assignments Page (Fallback)
            if (!foundName) {
                // Check the assignments page we already fetched
                try {
                    const $ = cheerio.load(gradesResponse.data);
                    // Often in "Welcome, Name" or top right
                    // or .sg-banner-text
                    const bannerText = $('.sg-banner-text').text(); // "Student Name"
                    if (bannerText && !bannerText.includes('Home Access Center')) {
                        foundName = bannerText.trim();
                    }
                } catch (e) { console.log('Strategy 3 failed'); }
            }

            if (foundName) {
                // Formatting: "Kumar, Vedansh" -> "Vedansh Kumar"
                if (foundName.includes(',')) {
                    const parts = foundName.split(',');
                    if (parts.length === 2) {
                        studentName = `${parts[1].trim()} ${parts[0].trim()}`;
                    } else {
                        studentName = foundName;
                    }
                } else {
                    studentName = foundName;
                }
                console.log(`Parsed Student Name: ${studentName}`);
            } else {
                console.log('Could not find student name.');
                if (process.env.DEBUG_SCRAPER === 'true') {
                    fs.writeFileSync('demographic_debug.html', demographicResponse.data);
                }
            }

        } catch (err) {
            console.error('Failed to fetch/parse student name:', err.message);
        }
        const $ = cheerio.load(gradesResponse.data);

        console.log('4. Parsing data...');
        const courses = [];

        // HAC structure parsing
        // Look for course headers
        $('.sg-header').each((i, header) => {
            let courseName = $(header).find('.sg-header-heading').text().trim();

            // Filter out non-course headers
            if (!courseName || courseName === 'Unknown' || courseName === 'Error' || courseName.trim() === '') return;

            let average = 0;
            let teacher = 'Unknown';
            let period = '';

            // 1. Parse Average
            let averageText = $(header).find('.sg-header-heading-right').text().trim();
            if (averageText) {
                average = parseFloat(averageText.replace('Current Average: ', '').replace('%', '').trim()) || 0;
            } else {
                const avgMatch = courseName.match(/AVG\s+(\d+(\.\d+)?)/i);
                if (avgMatch) {
                    average = parseFloat(avgMatch[1]);
                    courseName = courseName.replace(avgMatch[0], '').trim();
                }
            }

            // 2. Parse Period & Clean Name
            // Format: "1133A - 1 AP Eng III"
            const fullMatch = courseName.match(/^([A-Z0-9]+)\s*-\s*(\d+)\s+(.*)/);
            if (fullMatch) {
                period = fullMatch[2];
                courseName = fullMatch[3];
            } else {
                // Try simpler format: "1 AP Eng III"
                const simpleMatch = courseName.match(/^(\d+)\s+(.*)/);
                if (simpleMatch) {
                    period = simpleMatch[1];
                    courseName = simpleMatch[2];
                }
            }

            // 3. Parse Teacher
            // Look for mailto link
            const emailLink = $(header).find('a[href^="mailto:"]');
            if (emailLink.length > 0) {
                teacher = emailLink.text().trim();
            } else {
                // Fallback: Look for text inside the header that is NOT the heading or the average
                // This is a heuristic.
                const headerText = $(header).text();
                // Remove known parts
                const cleanText = headerText
                    .replace($(header).find('.sg-header-heading').text(), '')
                    .replace($(header).find('.sg-header-heading-right').text(), '')
                    .trim();

                if (cleanText.length > 0 && cleanText.length < 50) {
                    teacher = cleanText;
                }
            }

            // Clean up trailing hyphens/spaces
            courseName = courseName.replace(/-\s*$/, '').trim();

            // The assignments are usually in the NEXT sibling div with class sg-content-grid
            const contentGrid = $(header).next('.sg-content-grid');
            const assignments = [];
            const categories = [];

            // Parse Categories (often in a separate table or div within contentGrid)
            // Look for "Category" and "Average" headers
            // This is specific to HAC structure, might need adjustment.
            // Assuming they are in a table row with class 'sg-asp-table-data-row' but distinct from assignments?
            // Or maybe in a separate grid.
            // For now, let's try to calculate them from assignments if we can't find them, 
            // BUT the user said "fetch from HAC". 
            // Usually HAC has a "Categories" grid.

            // Let's look for the category table.
            const categoryRows = contentGrid.find('.sg-asp-table-data-row');
            // This selector might be too broad and catch assignments too.
            // Assignments usually have a date. Categories don't.

            categoryRows.each((k, row) => {
                const cols = $(row).find('td');
                // Heuristic: Categories usually have fewer columns or specific text
                // Assignments: Date, Category, Assignment, (blank), Score, Total, ...
                // Categories: Category, Weight, Points, %, ...

                const col1 = $(cols[0]).text().trim();
                const col2 = $(cols[1]).text().trim();

                // Check if it's a category row
                // If col1 is a category name and col2 is a weight/score?
                // This is tricky without seeing HTML.
                // Let's rely on the fact that assignments have a Date in col1 usually.
                const isDate = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(col1);

                if (!isDate && cols.length > 2) {
                    // Likely a category row?
                    // Or maybe it's just a header.
                }
            });

            // Parse assignments table
            contentGrid.find('.sg-asp-table-data-row').each((j, row) => {
                const cols = $(row).find('td');
                if (cols.length >= 5) {
                    const c0 = $(cols[0]).text().trim();
                    const c1 = $(cols[1]).text().trim();
                    const c2 = $(cols[2]).text().trim();
                    const c3 = $(cols[3]).text().trim();

                    // Check if c0 is a date
                    const isDate0 = c0.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/);

                    let date, name, category, scoreText, totalText;

                    if (isDate0) {
                        date = c0;

                        // Check for 9-column layout (Date Due | Date Assigned | Assignment | Category | Score | Total Points | Weight | Weighted Score | Weighted Total Points)
                        if (cols.length >= 9) {
                            name = c2;
                            category = c3;
                            scoreText = $(cols[4]).text().trim();
                            totalText = $(cols[5]).text().trim(); // Total Points is at index 5
                        }
                        // Fallback to previous logic for other layouts
                        else if (c1.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                            // 0=Due, 1=Assigned
                            name = c2;
                            category = c3;
                            scoreText = $(cols[4]).text().trim();
                            totalText = $(cols[5]).text().trim();
                        } else {
                            // 0=Due, 1=Name? or 1=Category?
                            name = c1;
                            category = c2;
                            scoreText = $(cols[3]).text().trim();
                            totalText = $(cols[4]).text().trim();
                        }
                    } else {
                        // console.log(`Skipping row ${j} in course ${i}: No date in first column. c0="${c0}"`);
                    }

                    const score = parseFloat(scoreText) || null;
                    const total = parseFloat(totalText) || 100;

                    if (name && category) {
                        assignments.push({
                            id: `a-${i}-${j}`,
                            name,
                            category,
                            score,
                            totalPoints: total,
                            dueDate: date,
                            weight: 1
                        });
                    }
                }
            });
            console.log(`Course "${courseName}" - Assignments Found: ${assignments.length}`);

            // Parse Categories & Weights
            // The categories table is in the .sg-asp-table-group inside the same contentGrid
            const categoryTable = contentGrid.find('.sg-asp-table-group table');
            console.log(`   Looking for category table... Found: ${categoryTable.length}`);

            if (categoryTable.length > 0) {
                categoryTable.find('tr').each((k, row) => {
                    const cols = $(row).find('td');
                    // Header row has th or td with bold? We skip if doesn't contain data numbers
                    // Columns: Category(0), Points(1), Max(2), Percent(3), Weight(4), CatPoints(5)
                    if (cols.length >= 5) {
                        const catName = $(cols[0]).text().trim();
                        const weightText = $(cols[4]).text().trim();
                        const weight = parseFloat(weightText);

                        console.log(`       Row ${k}: Name="${catName}", WeightText="${weightText}", Parsed="${weight}"`);

                        if (catName && !isNaN(weight) && catName !== 'Total Points:') {
                            categories.push({
                                name: catName,
                                average: 0, // Will be calculated/replaced
                                weight: weight
                            });
                        }
                    }
                });
            } else {
                console.log('   WARNING: No category table found with selector .sg-asp-table-group table');
                // Try broader selector?
            }

            // Calculate category averages from assignments if not explicitly found (or just always recalculate to be safe?)
            // Actually, HAC provides category averages? Not easily seen in the snippets.
            // Let's rely on our own calculation for average but use the SCRAPED weights.

            const catMap = {};
            // Initialize with scraped categories
            categories.forEach(c => {
                catMap[c.name] = { totalScore: 0, totalPoints: 0, count: 0, weight: c.weight };
            });

            assignments.forEach(a => {
                if (!catMap[a.category]) {
                    // If assignment has a category not in the table (rare), add it with 0 weight or default?
                    catMap[a.category] = { totalScore: 0, totalPoints: 0, count: 0, weight: 0 };
                }
                if (a.score !== null) {
                    catMap[a.category].totalScore += a.score;
                    catMap[a.category].totalPoints += a.totalPoints;
                    catMap[a.category].count++;
                }
            });

            // Rebuild categories array with calculated averages + scraped weights
            const finalCategories = [];
            for (const [catName, data] of Object.entries(catMap)) {
                if (data.totalPoints > 0 || data.weight > 0) {
                    finalCategories.push({
                        name: catName,
                        average: data.totalPoints > 0 ? parseFloat(((data.totalScore / data.totalPoints) * 100).toFixed(2)) : 0,
                        weight: data.weight
                    });
                }
            }

            console.log(`Parsed Course ${i}: "${courseName}" | Period: ${period} | Avg: ${average} | Teacher: ${teacher}`);
            if (finalCategories.length > 0) {
                console.log(`   Categories: ${finalCategories.map(c => `${c.name} (${c.weight})`).join(', ')}`);
            }

            courses.push({
                id: `c-${i}`,
                name: courseName,
                teacher: teacher,
                period: period,
                average,
                letterGrade: average >= 90 ? 'A' : average >= 80 ? 'B' : average >= 70 ? 'C' : average >= 60 ? 'D' : 'F',
                categories: finalCategories,
                assignments
            });
        });

        console.log(`Found ${courses.length} courses.`);

        // 5. Fetch Transcript (Credits)
        console.log('5. Fetching transcript...');
        const transcriptResponse = await client.get(`${BASE_URL}/Content/Student/Transcript.aspx`);
        const $transcript = cheerio.load(transcriptResponse.data);
        const transcript = [];
        $transcript('.sg-asp-table-data-row').each((i, row) => {
            const cols = $transcript(row).find('td');
            if (cols.length >= 4) {
                transcript.push({
                    course: $transcript(cols[0]).text().trim(),
                    description: $transcript(cols[1]).text().trim(),
                    mark: $transcript(cols[2]).text().trim(),
                    credit: $transcript(cols[3]).text().trim()
                });
            }
        });

        // 6. Fetch Schedule
        console.log('6. Fetching schedule...');
        // The Schedule page loads an iframe with the actual content
        const scheduleResponse = await client.get(`${BASE_URL}/Content/Student/Classes.aspx`);
        const $schedule = cheerio.load(scheduleResponse.data);

        // Helper to decode Cloudflare email protection
        function decodeEmail(encodedString) {
            const r = parseInt(encodedString.substr(0, 2), 16);
            let email = '';
            for (let n = 2; n < encodedString.length; n += 2) {
                const c = parseInt(encodedString.substr(n, 2), 16) ^ r;
                email += String.fromCharCode(c);
            }
            return email;
        }

        // Parse schedule table
        $schedule('.sg-asp-table-data-row').each((i, row) => {
            const cols = $schedule(row).find('td');
            if (cols.length >= 6) {
                const courseNameInSchedule = $schedule(cols[1]).text().trim(); // Description
                const periodText = $schedule(cols[2]).text().trim();
                const room = $schedule(cols[4]).text().trim();
                const days = $schedule(cols[5]).text().trim();

                // Extract Teacher and Email
                const teacherCell = $schedule(cols[3]);
                const teacherName = teacherCell.text().trim();

                let email = '';
                // Check for mailto
                const emailLink = teacherCell.find('a[href^="mailto:"]');
                if (emailLink.length > 0) {
                    email = emailLink.attr('href').replace('mailto:', '').trim();
                } else {
                    // Check for Cloudflare email protection
                    const cfLink = teacherCell.find('a[href^="/cdn-cgi/l/email-protection"]');
                    if (cfLink.length > 0) {
                        const href = cfLink.attr('href');
                        const encoded = href.split('#')[1];
                        if (encoded) {
                            email = decodeEmail(encoded);
                        }
                    }
                }

                // Find matching course
                const course = courses.find(c => c.name === courseNameInSchedule || c.name.includes(courseNameInSchedule) || courseNameInSchedule.includes(c.name));

                if (course) {
                    // Update Period (remove leading zeros)
                    const cleanPeriod = parseInt(periodText, 10).toString();
                    if (cleanPeriod && cleanPeriod !== 'NaN') {
                        course.period = cleanPeriod;
                    }

                    course.room = room;
                    course.days = days;

                    // Update teacher if unknown or if we have a better name
                    if (course.teacher === 'Unknown' || course.teacher === '' || !course.teacher) {
                        course.teacher = teacherName;
                    }

                    if (email) {
                        course.email = email;
                    }

                    console.log(`Matched Schedule for ${course.name}: Period ${course.period}, Room ${room}, Days ${days}, Email ${email}`);
                }
            }
        });

        // 7. Fetch Attendance (Loop for history)
        console.log('7. Fetching attendance... (Historical)');

        let attendanceEvents = [];
        let viewState = '';
        let eventValidation = '';
        let viewStateGenerator = ''; // Sometimes needed

        // Initial GET
        let attendanceResponse = await client.get(`${BASE_URL}/Content/Attendance/MonthlyView.aspx`);
        let $attendance = cheerio.load(attendanceResponse.data);

        // Helper to extract ASP.NET hidden fields
        const extractHidden = ($) => {
            return {
                viewState: $('#__VIEWSTATE').val(),
                eventValidation: $('#__EVENTVALIDATION').val(),
                viewStateGenerator: $('#__VIEWSTATEGENERATOR').val()
            };
        }

        // Parse initial hidden fields
        let hidden = extractHidden($attendance);
        viewState = hidden.viewState;
        eventValidation = hidden.eventValidation;
        viewStateGenerator = hidden.viewStateGenerator;

        // Loop 6 months back
        const MONTHS_TO_FETCH = 6;
        for (let i = 0; i < MONTHS_TO_FETCH; i++) {
            console.log(`Parsing month ${i + 1}/${MONTHS_TO_FETCH}...`);

            // 1. Extract Data from Current Page
            // (Same parsing logic as before)
            const monthYearText = $attendance('.sg-asp-calendar-header td[align="center"]').text().trim();
            const [monthName, yearStr] = monthYearText.split(' ');
            const year = parseInt(yearStr);
            const monthIndex = new Date(`${monthName} 1, 2000`).getMonth(); // 0-11

            console.log(`Processing: ${monthYearText}`);

            $attendance('#plnMain_cldAttendance td').each((i, el) => {
                const dayText = $attendance(el).text().trim();
                if (!dayText || isNaN(parseInt(dayText))) return;

                const day = parseInt(dayText);
                const date = new Date(year, monthIndex, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Strictly ignore future dates
                if (date > today) return;

                const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD local

                const title = $attendance(el).attr('title') || '';
                const style = $attendance(el).attr('style') || '';
                const bgcolor = $attendance(el).attr('bgcolor') || '';

                let code = '';
                let description = '';

                if (style.includes('CCCCCC') || bgcolor.includes('CCCCCC')) {
                    code = 'H'; description = 'School Closed';
                } else if (title.includes('Absent') || title.includes('Unexcused')) {
                    code = 'A'; description = title.includes('Unexcused') ? 'Unexcused Absence' : 'Absent';
                } else if (title.includes('Tardy')) {
                    code = 'T'; description = 'Tardy';
                } else if (style.includes('006600') || bgcolor.includes('006600') || title.includes('Present')) {
                    code = 'P'; description = 'Present';
                }

                if (code) {
                    // Avoid duplicates if we overlap (unlikely with month nav, but safe)
                    if (!attendanceEvents.find(e => e.date === dateStr)) {
                        attendanceEvents.push({ date: dateStr, code, description });
                    }
                }
            });

            // 2. Prepare Next Request (Previous Month)
            // Find "Previous" link: <a href="javascript:__doPostBack('ctl00$plnMain$cldAttendance','V9436')" ... title="Go to the previous month">
            const prevLink = $attendance('a[title="Go to the previous month"]').attr('href');
            if (!prevLink || !prevLink.includes('__doPostBack')) {
                console.log('No previous month link found. Stopping.');
                break;
            }

            // Extract arguments: __doPostBack('target', 'argument')
            // Regex to grab content inside quotes
            const matches = /__doPostBack\('([^']+)','([^']+)'\)/.exec(prevLink);
            if (!matches || matches.length < 3) {
                console.log('Could not parse previous link. Stopping.');
                break;
            }

            const eventTarget = matches[1];
            const eventArgument = matches[2];

            // 3. POST for Previous Month
            try {
                const formData = new URLSearchParams();
                formData.append('__EVENTTARGET', eventTarget);
                formData.append('__EVENTARGUMENT', eventArgument);
                formData.append('__VIEWSTATE', viewState);
                formData.append('__EVENTVALIDATION', eventValidation);
                if (viewStateGenerator) formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);

                // Add other hidden fields if necessary (usually just these are enough)

                attendanceResponse = await client.post(`${BASE_URL}/Content/Attendance/MonthlyView.aspx`, formData, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });

                $attendance = cheerio.load(attendanceResponse.data);

                // Update hidden fields for next iteration
                hidden = extractHidden($attendance);
                viewState = hidden.viewState;
                eventValidation = hidden.eventValidation;
                viewStateGenerator = hidden.viewStateGenerator;

            } catch (err) {
                console.error('Error fetching previous month:', err.message);
                break;
            }
        }

        console.log(`Parsed total ${attendanceEvents.length} attendance events.`);
        const attendance = attendanceEvents;

        // Return combined data
        return {
            studentName,
            courses,
            transcript,
            attendance
        };

    } catch (error) {
        console.error('HTTP Scraping failed:', error.message);
        throw error;
    }
}

function getMockData() {
    return {
        studentName: 'Demo Student',
        courses: [
            {
                id: 'c-0',
                name: 'AP English III',
                teacher: 'Doe, Jane',
                period: '1',
                average: 93,
                letterGrade: 'A',
                room: 'B216',
                days: 'A',
                email: 'jane_doe@roundrockisd.org',
                categories: [
                    { name: 'Summative', average: 90, weight: 0.6 },
                    { name: 'Formative', average: 95, weight: 0.4 }
                ],
                assignments: [
                    { id: 'a-0-1', name: 'Gatsby Essay', category: 'Summative', score: 90, totalPoints: 100, dueDate: '10/15/2025', weight: 1 },
                    { id: 'a-0-2', name: 'Vocab Quiz 5', category: 'Formative', score: 95, totalPoints: 100, dueDate: '10/10/2025', weight: 1 },
                    { id: 'a-0-3', name: 'Reading Check', category: 'Formative', score: 100, totalPoints: 100, dueDate: '10/05/2025', weight: 1 }
                ]
            },
            {
                id: 'c-1',
                name: 'Pre-Calculus',
                teacher: 'Smith, John',
                period: '2',
                average: 88,
                letterGrade: 'B',
                room: 'C102',
                days: 'A',
                email: 'john_smith@roundrockisd.org',
                categories: [
                    { name: 'Tests', average: 85, weight: 0.7 },
                    { name: 'Homework', average: 95, weight: 0.3 }
                ],
                assignments: [
                    { id: 'a-1-1', name: 'Unit 3 Test', category: 'Tests', score: 85, totalPoints: 100, dueDate: '10/20/2025', weight: 1 },
                    { id: 'a-1-2', name: 'HW 3.2', category: 'Homework', score: 100, totalPoints: 100, dueDate: '10/18/2025', weight: 1 }
                ]
            },
            {
                id: 'c-2',
                name: 'AP US History',
                teacher: 'White, Walter',
                period: '3',
                average: 95,
                letterGrade: 'A',
                room: 'D205',
                days: 'A',
                email: 'walter_white@roundrockisd.org',
                categories: [
                    { name: 'Exams', average: 94, weight: 0.6 },
                    { name: 'Quizzes', average: 96, weight: 0.4 }
                ],
                assignments: [
                    { id: 'a-2-1', name: 'Civil War Exam', category: 'Exams', score: 94, totalPoints: 100, dueDate: '10/12/2025', weight: 1 },
                    { id: 'a-2-2', name: 'Reconstruction Quiz', category: 'Quizzes', score: 96, totalPoints: 100, dueDate: '10/08/2025', weight: 1 }
                ]
            },
            {
                id: 'c-3',
                name: 'Physics I',
                teacher: 'Einstein, Albert',
                period: '4',
                average: 91,
                letterGrade: 'A',
                room: 'F110',
                days: 'B',
                email: 'albert_einstein@roundrockisd.org',
                categories: [
                    { name: 'Labs', average: 95, weight: 0.4 },
                    { name: 'Tests', average: 88, weight: 0.6 }
                ],
                assignments: [
                    { id: 'a-3-1', name: 'Motion Lab', category: 'Labs', score: 95, totalPoints: 100, dueDate: '10/22/2025', weight: 1 },
                    { id: 'a-3-2', name: 'Kinematics Test', category: 'Tests', score: 88, totalPoints: 100, dueDate: '10/14/2025', weight: 1 }
                ]
            },
            {
                id: 'c-4',
                name: 'Spanish III',
                teacher: 'Rodriguez, Maria',
                period: '5',
                average: 85,
                letterGrade: 'B',
                room: 'A105',
                days: 'B',
                email: 'maria_rodriguez@roundrockisd.org',
                categories: [
                    { name: 'Speaking', average: 80, weight: 0.3 },
                    { name: 'Writing', average: 85, weight: 0.3 },
                    { name: 'Tests', average: 90, weight: 0.4 }
                ],
                assignments: [
                    { id: 'a-4-1', name: 'Oral Presentation', category: 'Speaking', score: 80, totalPoints: 100, dueDate: '10/25/2025', weight: 1 },
                    { id: 'a-4-2', name: 'Essay', category: 'Writing', score: 85, totalPoints: 100, dueDate: '10/15/2025', weight: 1 }
                ]
            },
            {
                id: 'c-5',
                name: 'Computer Science',
                teacher: 'Lovelace, Ada',
                period: '6',
                average: 98,
                letterGrade: 'A',
                room: 'E101',
                days: 'B',
                email: 'ada_lovelace@roundrockisd.org',
                categories: [
                    { name: 'Projects', average: 100, weight: 0.5 },
                    { name: 'Tests', average: 96, weight: 0.5 }
                ],
                assignments: [
                    { id: 'a-5-1', name: 'Java Project', category: 'Projects', score: 100, totalPoints: 100, dueDate: '10/30/2025', weight: 1 },
                    { id: 'a-5-2', name: 'Midterm', category: 'Tests', score: 96, totalPoints: 100, dueDate: '10/10/2025', weight: 1 }
                ]
            },
            {
                id: 'c-6',
                name: 'Athletics',
                teacher: 'Coach, Ted',
                period: '7',
                average: 100,
                letterGrade: 'A',
                room: 'GYM',
                days: 'Daily',
                email: 'ted_coach@roundrockisd.org',
                categories: [
                    { name: 'Participation', average: 100, weight: 1.0 }
                ],
                assignments: [
                    { id: 'a-6-1', name: 'Weekly Participation', category: 'Participation', score: 100, totalPoints: 100, dueDate: '10/28/2025', weight: 1 }
                ]
            },
            {
                id: 'c-7',
                name: 'Study Hall',
                teacher: 'Monitor, Hall',
                period: '8',
                average: 100,
                letterGrade: 'A',
                room: 'LIB',
                days: 'Daily',
                email: 'hall_monitor@roundrockisd.org',
                categories: [
                    { name: 'Attendance', average: 100, weight: 1.0 }
                ],
                assignments: [
                    { id: 'a-7-1', name: 'Check-in', category: 'Attendance', score: 100, totalPoints: 100, dueDate: '10/28/2025', weight: 1 }
                ]
            }
        ],
        transcript: [
            { course: 'Algebra I', description: 'Algebra I', mark: '95', credit: '1.0' },
            { course: 'Biology', description: 'Biology', mark: '92', credit: '1.0' },
            { course: 'World Geo', description: 'World Geography', mark: '98', credit: '1.0' }
        ],
        attendance: [
            { date: '2025-12-01', code: 'P', description: 'Present' },
            { date: '2025-12-02', code: 'P', description: 'Present' },
            { date: '2025-12-03', code: 'P', description: 'Present' },
            { date: '2025-12-04', code: 'P', description: 'Present' },
            { date: '2025-12-05', code: 'A', description: 'Absent' }, // Absent example
            { date: '2025-12-08', code: 'P', description: 'Present' },
            { date: '2025-12-09', code: 'P', description: 'Present' },
            { date: '2025-12-10', code: 'T', description: 'Tardy' }, // Tardy example
            { date: '2025-12-11', code: 'P', description: 'Present' },
            { date: '2025-12-12', code: 'P', description: 'Present' },
            { date: '2025-12-22', code: 'H', description: 'School Closed' }, // Winter Break
            { date: '2025-12-23', code: 'H', description: 'School Closed' },
            { date: '2025-12-24', code: 'H', description: 'School Closed' },
            { date: '2025-12-25', code: 'H', description: 'School Closed' },
            { date: '2025-12-26', code: 'H', description: 'School Closed' },
            { date: '2025-12-29', code: 'H', description: 'School Closed' },
            { date: '2025-12-30', code: 'H', description: 'School Closed' },
            { date: '2025-12-31', code: 'H', description: 'School Closed' },
        ]
    };
}
