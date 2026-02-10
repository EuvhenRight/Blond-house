# Hair Studio — Portfolio & Booking

> Professional hair studio portfolio and online booking site for **Hair Chief** in Amsterdam. Built with Next.js 16, React 19, and Firebase.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## Overview

A modern, responsive web app that combines a **portfolio** for a hair stylist with a full **booking system**: service selection, calendar, time slots, email confirmations, and an admin dashboard for managing appointments.

- **Live site:** set via `NEXT_PUBLIC_SITE_URL`
- **Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS 4, Firebase (Firestore + Auth), NextAuth, Resend, FullCalendar

---

## Features

| Area | Description |
|------|-------------|
| **Portfolio** | Hero, about, approach, services, and contact with a polished, mobile-first UI |
| **Online booking** | Service selector, public calendar, time-slot picker, and confirmation flow |
| **Admin** | Protected dashboard with calendar view, appointment management, and analytics |
| **Auth** | NextAuth with credentials + optional Firebase adapter |
| **Emails** | Booking confirmations and admin notifications via Resend |
| **SEO & analytics** | Metadata, Open Graph, sitemap, robots, JSON-LD, Vercel Analytics |

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend / data:** [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **Auth:** [NextAuth.js](https://next-auth.js.org/)
- **Email:** [Resend](https://resend.com/)
- **Calendar:** [FullCalendar](https://fullcalendar.io/)
- **Validation:** [Zod](https://zod.dev/)
- **Testing:** [Jest](https://jestjs.io/), [Testing Library](https://testing-library.com/)
- **Deploy:** [Vercel](https://vercel.com/)

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** (or yarn/pnpm/bun)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/i-blond.git
cd i-blond
npm install
```

### 2. Environment variables

Copy the example env and fill in your values:

```bash
cp env.example .env.local
```

Edit `.env.local`. You’ll need at least:

- `NEXT_PUBLIC_SITE_URL` — e.g. `http://localhost:3001` for dev
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` — for admin auth
- Firebase config (`NEXT_PUBLIC_FIREBASE_*`) — for Firestore and optional auth
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — for booking emails (optional for local UI testing)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — for credentials-based admin login

See `env.example` for the full list and comments.

### 3. Run locally

```bash
npm run dev
```

App runs at **http://localhost:3001**.

### 4. Build and start (production-like)

```bash
npm run build
npm run start
```

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Start production server (port 3001) |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest tests |
| `npm run test:watch` | Jest in watch mode |
| `npm run test:coverage` | Jest with coverage report |

---

## Project structure (high level)

```
app/
├── actions/          # Server actions (e.g. appointments)
├── admin/            # Admin dashboard, login, analytics
├── api/              # API routes (NextAuth)
├── book/             # Public booking flow
├── components/       # UI: home, booking, admin, shared
├── hooks/            # e.g. useBooking
├── lib/              # Config, auth, Firebase, SEO, email, validation
├── privacy/          # Privacy policy
├── terms/            # Terms of service
├── layout.tsx        # Root layout & metadata
├── page.tsx          # Home
├── sitemap.ts        # Dynamic sitemap
└── robots.ts         # Robots.txt
```

---

## Testing

Unit and integration tests use Jest and React Testing Library:

```bash
npm run test
npm run test:coverage
```

---

## Deployment

The project is set up for **Vercel**:

1. Connect the repo to Vercel.
2. Add all required env vars from `env.example` in the Vercel project settings.
3. Deploy; the build uses `next build` and `next start` is not required on Vercel (they run the app for you).

For more detail, see [DEPLOY.md](./DEPLOY.md) if present.

---

## License

Private / All rights reserved — portfolio and booking system for Hair Studio (Hair Chief), Amsterdam.

---

**Hair Chief** · Hair Studio Amsterdam
