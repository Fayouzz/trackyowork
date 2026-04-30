# trackyowork

> Deep work tracker. Brutally honest focus scores.

Track your work sessions, detect distractions in real-time (tab switches, idle time), and get a Focus Score after every session. Know exactly how focused you really are.

---

## 🗂 Project Structure

```
trackyowork/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/   Layout, TimerRing, SessionResult
│   │   ├── hooks/        useSession (core tracking logic)
│   │   ├── lib/          api.js, utils.js, AppContext
│   │   └── pages/        Home, History, Dashboard, Pricing
│   └── package.json
├── backend/           # Express + sql.js (SQLite)
│   ├── server.js
│   └── package.json
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Backend

```bash
cd backend
npm install
npm start
# API running at http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) — done.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sessions/start` | Start a new session |
| PUT | `/api/sessions/:id/end` | End session with metrics |
| GET | `/api/sessions?tier=free\|paid` | List sessions |
| GET | `/api/sessions/:id` | Get session + distractions |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/distractions` | Log a distraction event |
| GET | `/api/dashboard/weekly` | Weekly stats (paid) |
| GET | `/api/export/csv` | Download CSV (paid) |
| GET | `/api/health` | Health check |

---

## 🚀 Deployment

### Frontend → Netlify

```bash
cd frontend
npm run build
# Drag the dist/ folder to netlify.com/drop
# OR use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

Set env var in Netlify dashboard:
```
VITE_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `FRONTEND_URL` = `https://your-netlify-app.netlify.app`
     - `PORT` = `3001`

### Backend → Fly.io

```bash
cd backend
fly launch --name trackyowork-api
fly deploy
```

---

## 💰 Monetization

The paywall is currently mocked (no real payment). To add real Stripe:

1. Install Stripe: `npm install stripe` in backend
2. Add to backend:

```js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/api/checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID, // your Price ID
      quantity: 1,
    }],
    mode: 'subscription', // or 'payment' for one-time
    success_url: `${process.env.FRONTEND_URL}/pricing?success=1`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
  });
  res.json({ url: session.url });
});
```

3. In `frontend/src/pages/Pricing.jsx`, replace `handleUpgrade` to:
   - Call `POST /api/checkout`
   - Redirect to Stripe with `window.location.href = data.url`

4. Add webhook to listen for `checkout.session.completed` to flip user tier in DB

---

## 📊 Data Model

```sql
-- Sessions
id, start_time, end_time, total_duration (s), distraction_time (s),
focus_score (0-100), longest_focus_streak (s), created_at

-- Distractions
id, session_id, timestamp, type ('tab_switch' | 'idle')
```

---

## 🔑 Focus Score Formula

```
Focus Score = (Total Time - Distraction Time) / Total Time × 100
```

Distraction triggers:
- **Tab switch**: `document.visibilitychange` → hidden
- **Idle**: No mouse/keyboard activity for 30 seconds

---

## 🎨 Tiers

| Feature | Free | Pro ($3/mo or $5 lifetime) |
|---------|------|---------------------------|
| Session tracking | ✓ | ✓ |
| Focus score | ✓ | ✓ |
| History | Last 5 | Unlimited |
| Weekly dashboard | ✗ | ✓ |
| CSV export | ✗ | ✓ |
| Dark mode | ✗ | ✓ |

---

Built with React, Vite, Tailwind CSS, Express, sql.js
