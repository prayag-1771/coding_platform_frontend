# Coding Platform

A role-based coding practice and classroom platform built with **Next.js (App Router)**, **React**, and **MongoDB**.  
It supports students solving problems, teachers managing classrooms/assignments, and authors creating and curating coding challenges.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
- [Scripts](#scripts)
- [How the App Works](#how-the-app-works)
- [API Surface (High-Level)](#api-surface-high-level)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)

---

## Overview

This repository contains the coding platform application (UI pages + server routes) where users can:

- register/login with role-based access,
- browse and solve coding problems in an in-browser editor,
- run sample/hidden test cases (local JS execution + remote execution service for compiled/interpreted languages),
- submit assignment solutions,
- manage classrooms and assignment workflows,
- author problems manually or generate drafts using a local LLM endpoint.

The app uses Next.js route handlers under `app/api/**` for backend functionality and MongoDB models for persistence.

---

## Core Features

### 1) Coding Workspace
- Monaco editor-based coding interface.
- Language switching (`javascript`, `cpp`, `python` workflows).
- Terminal-like output panel and run/test controls.
- Problem loading, sample test execution, and score display.

### 2) Auth + Roles
- Cookie/JWT based authentication.
- Supported roles:
  - `student`
  - `teacher`
  - `author`
- Different dashboards and pages per role.

### 3) Problem Management
- Create/edit/save coding problems.
- Test case support (`sample` and `hidden`) with weighted scoring.
- Problem schema validation logic in `lib/problemSchema.ts`.

### 4) Classroom + Assignments
- Classroom creation and student membership endpoints.
- Assignment creation and per-assignment problem workflows.
- Assignment submissions API.

### 5) AI-Assisted Problem Authoring
- API route to generate structured problem JSON from a prompt.
- Integrates with a local Ollama-compatible endpoint (`http://localhost:11434/api/generate`).

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI (Select), Lucide icons
- **Editor:** Monaco (`@monaco-editor/react`)
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (`jsonwebtoken`) + HttpOnly cookies
- **Animation/UX:** GSAP
- **Language:** JavaScript + TypeScript (mixed codebase)

---

## Project Structure

```text
app/
  api/                    # Route handlers (auth, problems, classrooms, assignments, AI)
  teacher/                # Teacher dashboard and classroom/problem management views
  student/                # Student dashboard and classroom views
  author/                 # Author dashboard and problem authoring/editing pages
  assignments/[id]/       # Assignment solve view
  problems/[id]/          # Problem detail view
components/               # Reusable UI + editor/testing helpers
lib/                      # DB connection, auth/JWT, schema helpers
models/                   # Mongoose models
problems/                 # Sample problem JSON files
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance (local or hosted)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the repository root:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/coding-platform
JWT_SECRET=replace-with-a-secure-random-secret
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-executor-api-key
```

#### Variable reference

- `MONGODB_URI` — MongoDB connection string used by `lib/mongodb.js`.
- `JWT_SECRET` — signing secret for auth tokens (defaults to `dev-secret` if not provided, not recommended for production).
- `NEXT_PUBLIC_BASE_URL` — base URL for external code execution service (`/submit` + `/result/:jobId`).
- `NEXT_PUBLIC_API_KEY` — API key sent to execution service as `X-API-Key`.

> Optional (AI generation): run an Ollama-compatible model server at `http://localhost:11434` with model name `mistral` if you want `/api/ai/author-problem` to work.

### Run Locally

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Scripts

- `npm run dev` — start development server.
- `npm run build` — production build.
- `npm run start` — run production server.
- `npm run lint` — run ESLint checks.

---

## How the App Works

1. **Authentication**
   - Users sign up via `/register` and authenticate via `/login`.
   - Auth endpoints issue a JWT token cookie.

2. **Problem solving flow**
   - Problem metadata is fetched from `/api/problems` and `/api/problems/:id`.
   - JavaScript can run sample tests locally.
   - Other languages use the remote execution API helper (`components/codeExecutorApi.js`).

3. **Assignments**
   - Assignment pages load assignment details and associated problem.
   - Submissions are posted through assignment submission endpoints.

4. **Role experiences**
   - Student, teacher, and author pages are segmented under `app/student`, `app/teacher`, and `app/author`.

---

## API Surface (High-Level)

Representative route groups:

- `app/api/auth/*` — register/login
- `app/api/me` and `app/api/logout` — current user + sign out
- `app/api/problems/*` — list/get/create/update problem endpoints
- `app/api/classroom/*` — classroom CRUD and membership workflows
- `app/api/assignments/*` — assignment CRUD and retrieval
- `app/api/assignment-submissions` — submission writes/reads
- `app/api/ai/author-problem` — AI problem generation endpoint

For implementation details, see files under `app/api/**` and schema/model definitions under `lib/` and `models/`.

---

## Development Notes

- The repo currently mixes `.js/.jsx` and `.ts/.tsx` files.
- Keep route handlers inside `app/api/**/route.*`.
- If adding auth-protected pages, align with existing cookie/JWT flow (`lib/auth.js`, `lib/jwt.ts`).
- If adding new models, ensure DB connection is initialized through `connectDB()` before usage.

---

## Troubleshooting

- **`Please define MONGODB_URI in .env`**
  - Add `MONGODB_URI` to `.env.local`.

- **Remote execution fails**
  - Verify `NEXT_PUBLIC_BASE_URL` points to a reachable executor service.
  - Verify `NEXT_PUBLIC_API_KEY` is valid.

- **AI generation route errors**
  - Confirm Ollama (or compatible API) is running at `http://localhost:11434`.
  - Ensure model `mistral` is available in the local runtime.

- **Auth appears broken in production**
  - Ensure `JWT_SECRET` is set to a strong secret.
  - Check cookie/security behavior with `NODE_ENV=production`.
