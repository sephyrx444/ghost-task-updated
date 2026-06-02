# GhostTask AI — Smart Task Scheduler

An AI-powered productivity dashboard with per-user task isolation, missed-task notifications, intelligent rescheduling, and calendar history browsing.

## 🚀 Features

- **Per-user task isolation** — every user's tasks are private and scoped to their account
- **Bell notification dropdown** — missed/overdue task alerts in a dropdown menu
- **Calendar history browsing** — click any past date to see what tasks were scheduled
- **AI reschedule suggestions** — automatically detects missed tasks and suggests optimal new times
- **Pomodoro Focus Mode** — 25-min timer linked to your active tasks
- **Productivity analytics** — completion rates, weekly chart, category breakdown
- **Secure auth** — JWT-based login/register with bcrypt password hashing

## 🛠️ Tech Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **TailwindCSS 4**, custom animations
- **MongoDB + Mongoose** with per-user data isolation
- **JWT authentication** (jsonwebtoken + bcryptjs)

## 🏃 Getting Started

### 1. Clone & Install

```bash
git clone <your-repo>
cd ghosttask-enhanced
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ghosttask
JWT_SECRET=your-long-random-secret-key
```

### 3. Run Dev Server

```bash
npm run dev
```

Open http://localhost:3000 — register an account to get started.

## 🌐 Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
4. Click **Deploy** ✅

No other configuration needed — Next.js auto-detects the framework.

## 📁 Project Structure

```
app/
  api/
    auth/login/     — POST login
    auth/register/  — POST register
    tasks/          — GET/POST tasks (user-scoped)
    tasks/[id]/     — PUT complete, DELETE remove
    suggestions/    — GET/POST AI suggestions (user-scoped)
    suggestions/[id]/ — PUT apply, DELETE reject
    activities/     — GET activity log (user-scoped)
    statistics/     — GET dashboard stats (user-scoped)
    focus/          — POST focus session
  dashboard/        — Main dashboard page
  page.tsx          — Login/Register page

components/dashboard/
  Sidebar.tsx           — Navigation sidebar
  TaskList.tsx          — Task list + add form
  CalendarWidget.tsx    — Calendar with date browsing
  RescheduleSuggestions.tsx — AI suggestions panel
  FocusTimer.tsx        — Pomodoro timer
  ProductivityOverview.tsx  — Chart + score
  RecentActivity.tsx    — Activity log

models/             — Mongoose schemas (all with userId)
lib/auth.ts         — JWT extraction helper
```
