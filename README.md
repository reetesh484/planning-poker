# ♠ Planning Poker

A fast, minimal, real-time Planning Poker application designed for story point estimation during backlog grooming and sprint planning sessions with 10–15 participants.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)

---

## ✨ Features

- **⚡ Real-Time Synchronization**: Multi-user state sync across 10–15 participants powered by Node.js + Socket.io.
- **🎯 Minimal Click Story Points**: Prominent 1-click card selection bar right on the main screen for maximum speed during grooming.
- **📊 0.5 to 6 Story Points Deck**:
  - **Default Deck**: `0.5`, `1`, `2`, `3`, `4`, `5`, `6`, `?`, `☕`
  - **Optional Half Points**: Click **"+ Half Points"** to enable `1.5`, `2.5`, `3.5`, `4.5`, `5.5` cards.
- **📐 Ceil Half-Point Rounding Rule**:
  - Calculated raw average story points are automatically rounded up to the nearest `0.5` increment using `Math.ceil(avg * 2) / 2`.
  - *Examples*: `3.2` $\rightarrow$ `3.5`, `3.8` $\rightarrow$ `4.0`.
- **🔗 Instant Shareable Room Links**: Anyone can create a room and copy a share link (`http://localhost:3001/?room=your-room-id`) in one click.
- **📋 Optional Story Titles & Export**:
  - Add optional ticket IDs or story titles (e.g. `PROJ-101 Search Bar UI`).
  - Completed rounds are saved to session history. Export via:
    - **Copy All** — plain text in `id -> story points` format (one per line), e.g. `PROJ-101 -> 3.5`.
    - **Export PDF** — opens the browser print dialog (Save as PDF).
- **👁️ Spectator Mode**: Join as an observer without affecting voting progress or statistics.

---

## 🚀 Quick Start

### 1. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 2. Run Locally

Start both the backend real-time server and frontend dev server:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** (or **[http://localhost:3001](http://localhost:3001)** for unified server) in your browser.

---

## 🌐 Sharing Rooms with Your Team

### Local Wi-Fi / Office Network
Share your local IP with teammates on the same network:
```bash
ipconfig getifaddr en0
```
Open: `http://<YOUR_IP>:3001/?room=sprint-planning`

### Public Internet URL (Cloudflare Tunnel)
Generate a instant public URL for remote participants:
```bash
npx cloudflared tunnel --url http://localhost:3001
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express, Socket.io
- **Design**: Sleek dark mode glassmorphism with responsive micro-interactions

---

## 📄 License

MIT License
