# AlignTrack ✨

> A modern, intuitive personal tracker designed specifically for clear aligner (Invisalign) treatments. Keep track of daily wear time, aligner set schedules, orthodontist appointments, discomfort logs, and treatment milestones — all in one place.

---

## 🌟 Key Features

- **⏱️ Live & Manual Wear Time Tracking**: 
  - One-click Start/Stop timer with real-time visual progress ring.
  - Manual entry logging with custom start and end timestamps so you never lose track of past wear sessions.
  - Automatic midnight-crossing calculation and daily target comparison (e.g., 20h or 22h targets).
- **📅 Smart Aligner Set Schedule**:
  - Distinguishes between **Planned** and **Actual** change dates & times.
  - Automatic cascade recalculation of future sets when your switch date shifts.
  - Support for multi-phase treatments (e.g., 10-day cycles shifting to 7-day cycles).
- **🩺 Visit & Issue Journal**:
  - Categorized symptom tracking (pain, pressure, sharp edges, attachment issues).
  - Flag questions and issues directly for your next orthodontic visit.
- **🗓️ Treatment Calendar**:
  - Monthly and weekly views showing planned changes, completed swaps, wear targets, and upcoming appointments.
- **🔔 Notifications & Reminders**:
  - In-app and browser push notifications for aligner switch days and upcoming visits.
- **📱 PWA & Mobile-First**:
  - Fully responsive with desktop sidebar and mobile bottom-bar navigation.
  - Installable as a Progressive Web App (PWA) on iOS and Android.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript) + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Calendar**: FullCalendar
- **Charts**: Chart.js + React-Chartjs-2
- **PWA**: `vite-plugin-pwa`

### Backend
- **Runtime**: Node.js + Express (TypeScript)
- **Database**: MongoDB (Mongoose) / Local JSON file store fallback
- **Date Handling**: `date-fns` & `date-fns-tz`
- **Security**: Helmet, Rate Limiting, bcryptjs, JWT authentication
- **Push Notifications**: `web-push`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/justanothercseguy/AlignTrack.git
cd AlignTrack
