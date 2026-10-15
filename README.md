# Gradify 🎓

<div align="center">

[![React](https://img.shields.io/badge/React-18.2-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5.2-black.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**A fast, student-optimized web interface and academic dashboard for PowerSchool Home Access Center (HAC).**

[Features](#-key-features) • [Architecture](#-architecture--privacy) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-configuration) • [Disclaimer](#-disclaimer)

</div>

---

## 📌 Overview

**Gradify** modernizes the traditional, table-heavy PowerSchool Home Access Center (HAC) portal into a sleek, responsive, and intuitive dashboard. Built specifically for K-12 students and parents, Gradify extracts academic data directly from your district's HAC portal and transforms it into actionable insights, interactive simulators, and clean visualizations.

---

## ✨ Key Features

### 📊 Real-Time Academic Dashboard
- **Grade Triage**: Instant visual cards displaying current course averages, letter grades, and last-updated timestamps.
- **Estimated GPA Pill**: Real-time estimated cumulative GPA calculation directly on  overview screen.

### 🧮 What-If Grade & GPA Simulators
- **Hypothetical Assignment Modeling**: Add custom or hypothetical assignments with custom categories and weights to see how future tests or quizzes impact your overall class average.
- **Weighted & Unweighted GPA Calculator**: Calculates both standard 4.0 unweighted GPA and weighted GPA (with automatic +1.0 bump for AP, IB, and Advanced courses).

### 📝 Assignment & Category Deep Dives
- **Category Breakdowns**: Interactive breakdown of formative vs. summative weights and category averages.
- **Visual Analytics**: Interactive category distribution donut charts and grade progression line charts powered by Recharts.
- **Assignment Timelines**: Chronological listing of assignments with points earned, points possible, and due dates.

### 📅 Calendar & Attendance
- **Attendance Tracking**: View attendance records, absences, tardies, and school events parsed directly from HAC.
- **Student Reminder System**: Add, manage, and complete personal academic to-dos and assignment reminders linked to specific courses.

### ✉️ Teacher Directory
- Direct contact cards for every instructor with one-click email integration, class period mapping, and room numbers.

### 🎨 Custom Theme Engine
- **Preset Themes**: Classic, Ocean, Sunset, Lemon, and Magenta.
- **Custom Theme Studio**: Interactive HSL color picker, dynamic ambient glow intensity controls, and custom border-radius adjustments stored in local storage.

### 👥 Multi-Profile Support
- Manage and switch between multiple student accounts or sibling profiles seamlessly on shared devices.

---

## 🛡️ Architecture & Privacy

Gradify is engineered with a **local-first privacy approach**:

```
┌──────────────────┐         HTTP/REST         ┌───────────────────────┐         HTTPS Scrape         ┌───────────────────────┐
│                  │  ───────────────────────►  │                       │  ─────────────────────────►  │                       │
│  React Frontend  │                            │  Node/Express Server  │                              │  District HAC Portal  │
│  (Vite + TS)     │  ◄───────────────────────  │  (Cheerio + Cookies)  │  ◄─────────────────────────  │  (PowerSchool)        │
└──────────────────┘         JSON Data          └───────────────────────┘          HTML Docs           └───────────────────────┘
```

- **Zero Cloud Databases**: Student credentials and parsed grade histories are **never** transmitted to third-party databases, cloud backends, or telemetry trackers.
- **Local Storage Encapsulation**: Stored sessions and user preferences live exclusively in the user's browser `LocalStorage`.
- **Lightweight Scraper**: Direct HTTP cookie-jar session handling using `tough-cookie` and `cheerio` delivers sub-second response times without the overhead of heavy headless browsers.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS 3](https://tailwindcss.com/) + CSS Variables (Dynamic HSL) |
| **Icons & UI Primitives** | [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/) |
| **Data Visualization** | [Recharts 2](https://recharts.org/) |
| **Backend & API** | [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) |
| **HTML Parsing & Session** | [Cheerio 1.0](https://cheerio.js.org/), [Axios](https://axios-http.com/), [tough-cookie](https://github.com/salesforce/tough-cookie) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/vex-codes/gradify.git
cd gradify
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Optionally configure your school district's Home Access Center URL in `.env`:
```env
PORT=3000
# HAC_BASE_URL=https://accesscenter.yourdistrict.org/HomeAccess
```

### 4. Run the Application

Start both the backend scraper service and the frontend development server:

#### Terminal 1 — Backend API:
```bash
node server/index.js
```
The scraper service will run at `http://localhost:3000`.

#### Terminal 2 — Frontend App:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

> **Note (Demo Mode)**: To test the interface without logging into an active school account, sign in with username `demo` and password `demo` to load bundled mock data.

---

## 📦 Scripts

- `npm run dev`: Starts Vite local development server
- `npm run build`: Compiles TypeScript and builds optimized production assets
- `npm run lint`: Runs ESLint verification across TypeScript codebase
- `npm run preview`: Previews production build locally

---

## 📁 Project Structure

```
Gradify/
├── server/
│   ├── index.js              # Express API endpoints (/api/login)
│   ├── scraper-http.js       # Fast Cheerio/Axios HAC scraper & parser
│   ├── scraper.js            # Puppeteer fallback scraper
│   ├── standalone-scraper.js # Standalone scraping script
│   └── test-scraper.js       # Scraper diagnostic script
├── src/
│   ├── components/
│   │   ├── course/           # What-If calculator components
│   │   ├── dashboard/        # Course cards and overview elements
│   │   ├── insights/         # GPA charts and analytics
│   │   ├── layout/           # Sidebar, BottomNav, and MainLayout
│   │   ├── theme/            # Theme builder modal & controls
│   │   └── ui/               # Reusable UI primitives (Button, Card, Switch)
│   ├── context/
│   │   ├── AuthContext.tsx   # Session, multi-profile, and sync management
│   │   └── ThemeContext.tsx  # Dynamic CSS variable & HSL injection engine
│   ├── lib/
│   │   ├── api.ts            # Client API fetch calls
│   │   ├── mockData.ts       # Fallback demonstration dataset
│   │   ├── types.ts          # Core TypeScript data interfaces
│   │   └── utils.ts          # Styling and class utilities
│   ├── pages/
│   │   ├── Calendar.tsx      # Attendance & task calendar
│   │   ├── ContactTeachers.tsx # Teacher directory with direct mail links
│   │   ├── CourseDetail.tsx  # Detailed course breakdowns & charts
│   │   ├── Dashboard.tsx     # Main grade portal
│   │   ├── GPA.tsx           # GPA breakdown page
│   │   ├── Login.tsx         # District authentication & profile switcher
│   │   └── Settings.tsx      # Appearance, profile, and cache settings
│   ├── App.tsx               # Route definitions
│   └── main.tsx              # React entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Security Best Practices

- **No Hardcoded Credentials**: Ensure no real usernames, passwords, or session cookies are committed to version control.
- **Keep Debug Files Gitignored**: Scraper diagnostic dumps (`*_debug.html`) contain personal academic records and are strictly excluded via `.gitignore`.
- **Local Proxying**: Never expose the backend scraping server directly to the public internet without an authentication layer and rate limiter.

---

## ⚖️ Disclaimer

Gradify is an independent, open-source project created for educational and utility purposes. It is **not** affiliated with, authorized, maintained, sponsored, or endorsed by PowerSchool LLC, SunGard, or any of their affiliates. All product and company names are trademarks™ or registered® trademarks of their respective holders.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
