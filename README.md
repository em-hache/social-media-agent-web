# Social Media Agent — Web Dashboard

![Next.js 16](https://img.shields.io/badge/Next.js-16-black)
![Build](https://github.com/em-hache/social-media-agent-web/actions/workflows/publish.yml/badge.svg?branch=main)
![React 19](https://img.shields.io/badge/React-19-61DAFB)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)

Admin dashboard for managing WhatsApp communications, users, recipients, and distribution lists.

---

**[Features](#features)** · **[Tech Stack](#tech-stack)** · **[Architecture](#architecture)** · **[Getting Started](#getting-started)** · **[Configuration](#configuration)** · **[Development](#development)** · **[CI/CD](#cicd)**

---

This is the web interface for the [Social Media Agent](https://github.com/em-hache/social-media-agent) system. It provides a dashboard where administrators can monitor WhatsApp connectivity, manage users and recipients, maintain distribution lists, draft AI-powered messages, and track outbox delivery status — all without interacting with the backend API directly.

The dashboard communicates with two backend services: the **main service** (conversation engine, user and recipient management, outbox) and the **WhatsApp gateway** (connection status, QR authentication). All backend calls are proxied through Next.js API routes so that credentials and internal URLs are never exposed to the browser.

## Features

- **WhatsApp connection management** — view connection status and scan QR codes to authenticate the gateway
- **User administration** — list, create, edit, activate, and deactivate admin/manager/regular users
- **Recipient management** — maintain the list of message recipients with search, pagination, and status controls
- **Distribution lists** — view, edit, and manage membership of named recipient groups
- **Message crafting** — compose formal messages from bullet points using Claude AI (via the main service)
- **Outbox monitoring** — track pending, sent, and failed messages with date-range and per-recipient filters
- **Single admin auth** — lightweight credential-based login with JWT sessions (no external auth provider required)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Authentication | NextAuth 4 (Credentials provider, JWT sessions) |
| Runtime | Node.js 22 |
| Containerization | Docker (multi-stage build) |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  Dashboard pages (React, Tailwind)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│               Next.js Server (port 3005)                     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  App Router  │  │  API Routes  │  │   Middleware      │   │
│  │  (pages)     │  │  (proxy)     │  │   (auth guard)   │   │
│  └──────────────┘  └──────┬───────┘  └──────────────────┘   │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │                             │
┌─────────────▼──────────┐   ┌─────────────▼──────────┐
│   Main Service          │   │   WhatsApp Gateway     │
│   (port 8000)           │   │   (port 3000)          │
│                         │   │                        │
│  Users, Recipients,     │   │  Connection status,    │
│  Distribution Lists,    │   │  QR code, message      │
│  Outbox, AI crafting    │   │  delivery              │
└─────────────────────────┘   └────────────────────────┘
```

### Project structure

```
app/
├── (dashboard)/           # Route group — all protected dashboard pages
│   ├── layout.tsx         # Dashboard shell (Sidebar + Topbar)
│   └── dashboard/
│       ├── whatsapp/      # WhatsApp connection status & QR
│       ├── users/         # User management
│       ├── recipients/    # Recipient management
│       ├── lists/         # Distribution list management
│       ├── history/       # Message crafting
│       └── outbox/        # Outbox monitoring
├── api/                   # Next.js API routes (proxies to backend services)
│   ├── auth/[...nextauth] # NextAuth handler
│   ├── users/
│   ├── recipients/
│   ├── lists/
│   ├── messages/
│   ├── outbox/
│   └── whatsapp/
├── login/                 # Login page
├── layout.tsx             # Root layout (fonts, session provider)
└── globals.css            # Tailwind imports + custom theme
components/
├── Sidebar.tsx            # Navigation + WhatsApp status indicator
├── Topbar.tsx             # Page header
├── StatusBadge.tsx        # Colored status/role badges
├── SessionProvider.tsx    # NextAuth session wrapper
└── Tooltip.tsx            # Tooltip component
lib/
├── api-client.ts          # Backend HTTP client (fetch wrappers)
├── auth.ts                # NextAuth configuration
└── types.ts               # Shared TypeScript interfaces
middleware.ts              # Route protection (JWT check on /dashboard/*)
```

### Authentication flow

1. User submits username + password on `/login`
2. NextAuth `CredentialsProvider` compares against `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars
3. On success, a JWT is issued and stored as a cookie
4. The middleware checks for a valid JWT on all `/dashboard/*` routes
5. API routes verify the session server-side before proxying requests

## Getting Started

### Prerequisites

- Node.js 22+
- The [main service](https://github.com/em-hache/social-media-agent) running (default: port 8000)
- The WhatsApp gateway running (default: port 3000)

### Installation

```bash
git clone https://github.com/em-hache/social-media-agent-web.git
cd social-media-agent-web

npm install
```

### Environment setup

Create a `.env.local` file in the project root:

```bash
# Admin login
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3005

# Backend services (server-side only — internal hostnames)
WHATSAPP_GW_URL=http://localhost:3000
MAIN_SERVICE_URL=http://localhost:8000

# Public URLs (browser-accessible — used by client-side code)
NEXT_PUBLIC_WHATSAPP_GW_URL=http://localhost:3000
NEXT_PUBLIC_MAIN_SERVICE=http://localhost:8000
```

### Running locally

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3005`.

### Running with Docker

```bash
docker build -t social-media-agent-web .
docker run -p 3005:3005 --env-file .env.local social-media-agent-web
```

## Configuration

| Variable | Description | Default |
|----------|-------------|:---:|
| `ADMIN_USERNAME` | Admin login username | — |
| `ADMIN_PASSWORD` | Admin login password | — |
| `NEXTAUTH_SECRET` | Secret for JWT signing (generate with `openssl rand -base64 32`) | — |
| `NEXTAUTH_URL` | Canonical URL of the app | `http://localhost:3005` |
| `WHATSAPP_GW_URL` | WhatsApp gateway URL (server-side) | `http://localhost:3000` |
| `MAIN_SERVICE_URL` | Main backend service URL (server-side) | `http://localhost:8000` |
| `NEXT_PUBLIC_WHATSAPP_GW_URL` | WhatsApp gateway URL (browser-accessible) | `http://localhost:3000` |
| `NEXT_PUBLIC_MAIN_SERVICE` | Main service URL (browser-accessible) | `http://localhost:8000` |

> **Note:** The `NEXT_PUBLIC_*` variables are embedded into the client bundle at build time. In production, these should point to the externally reachable URLs of the backend services. The non-public variants are used by the Next.js API routes server-side and can use internal Docker network hostnames.

## Development

### Dev server

```bash
npm run dev
```

Runs on port 3005 with hot reload.

### Linting

```bash
npm run lint
```

### Build

```bash
npm run build
```

Produces a standalone output in `.next/standalone` suitable for containerized deployment.

### Code conventions

- All user-facing text is in Spanish
- Custom brand colors: `brand-cream` (#fcf2e6) and `brand-red` (#bf342a)
- Tailwind CSS 4 with `@theme` directive for custom colors
- Next.js App Router with route groups for layout separation

## CI/CD

A GitHub Actions workflow at `.github/workflows/publish.yml` builds and publishes a Docker image to the GitHub Container Registry (`ghcr.io`) on every push to `main` and on version tags (`v*`). The image is tagged as `latest` for main-branch builds.