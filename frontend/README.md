# TWAX Frontend

Next.js dashboard for AI-powered tech news moderation.

## Features

- 🃏 **Tinder-style swipe UI** - Approve, reject, or defer articles
- ⌨️ **Keyboard shortcuts** - A (approve), R (reject), S (skip/defer)
- 📱 **Mobile-friendly** - Touch gestures for swipe on mobile
- 🌙 **Dark mode** - Easy on the eyes

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local`:

```
BACKEND_URL=http://localhost:8000
```

## Tech Stack

- Next.js 15
- React 19
- Framer Motion (swipe gestures)
- TanStack Query (data fetching)
