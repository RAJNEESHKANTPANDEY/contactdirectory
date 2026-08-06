# DirectoryHQ — Contact & Address Management Directory

A professional, self-hosted contact and address directory built with Next.js 14.
Public visitors can search and browse officials; admins get a password-protected
console to manage the full register. All data — contact records and photos —
is stored on the filesystem (a JSON file plus an uploads folder), no database
required.

## Features

**Public directory**
- Searchable, filterable grid of every official (search by name, designation,
  department, phone, email, employee ID, tags)
- Filters for department, category, city, state and status
- Clicking an official morphs their card directly into a full detail panel —
  a Framer Motion shared-element animation, with **no page navigation and no
  URL change**
- The detail panel shows full contact information plus the official's place
  in the **administrative hierarchy**: the chain of superiors above them,
  peers who share their manager, and their direct reports — all clickable,
  so you can walk the org chart without leaving the panel
- Live header stats (total officials, active count, departments)

**Admin console** (`/admin`, password-protected)
- Dashboard with a searchable table of every official, quick stats, and
  edit/delete actions
- Add/edit form with photo upload, a "reports to" picker (which prevents
  circular hierarchies), tags, and every profile field
- One-click CSV export of the full directory
- Session-based login using a signed, httpOnly cookie (no third-party auth
  service required)

## Tech stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Framer Motion** for the shared-element detail animation
- **lucide-react** for icons
- Plain **JSON file + filesystem** storage — no database
  - `data/contacts.json` — the record store
  - `data/uploads/` — uploaded photos

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then edit the values below
npm run dev
```

Visit `http://localhost:3000` for the public directory and
`http://localhost:3000/admin` for the admin console.

### Environment variables (`.env.local`)

| Variable         | Description                                                              |
|-------------------|---------------------------------------------------------------------------|
| `ADMIN_PASSWORD`  | The password used to sign in to `/admin`. **Change this before deploying.** |
| `SESSION_SECRET`  | Random string used to sign the admin session cookie. Generate one with `openssl rand -hex 32`. |

If `ADMIN_PASSWORD` is not set, it defaults to `admin123` — fine for trying
things out locally, but make sure to set a real value before deploying
anywhere public.

## Data & storage

- Contact records live in `data/contacts.json`. Writes are queued and use an
  atomic rename so concurrent edits don't corrupt the file.
- Uploaded photos are saved to `data/uploads/` and served through
  `/api/images/[filename]`, which validates the filename to prevent path
  traversal.
- Deleting an official automatically un-assigns anyone who reported to them
  (they become "no manager" rather than being deleted).
- Sample data: the project ships with 23 seed officials across six
  departments and four hierarchy levels so you can see filtering, search and
  the hierarchy view working immediately. Feel free to delete them from the
  admin console and add your own.

## Project structure

```
app/
  page.tsx                     Public directory (client component)
  admin/
    login/page.tsx             Admin login (no chrome)
    (dashboard)/
      layout.tsx                Sidebar/topbar chrome for protected pages
      page.tsx                  Admin dashboard
      new/page.tsx               Add official
      edit/[id]/page.tsx         Edit official
  api/
    auth/{login,logout,me}      Session endpoints
    contacts, contacts/[id]     CRUD
    upload                      Photo upload
    images/[filename]           Photo serving
    export                      CSV export (admin only)
components/                    Shared UI: cards, filters, forms, overlay, etc.
lib/
  db.ts                        JSON file storage (server-only)
  auth.ts                      Edge-compatible signed session tokens
  hierarchy.ts                 Client-safe hierarchy helpers
  format.ts                    Formatting helpers
data/
  contacts.json                 The record store
  uploads/                       Uploaded photos
middleware.ts                  Protects /admin/* pages and mutating API calls
```

## Security notes

- `/admin/*` (except `/admin/login`) and any `POST`/`PUT`/`PATCH`/`DELETE`
  to `/api/contacts` or `/api/upload` require a valid session cookie,
  enforced in `middleware.ts`.
- The session token is a signed (HMAC-SHA256), expiring token — not a
  database-backed session — so "logging out" clears the cookie client-side;
  a copied token would remain valid until its 12-hour expiry. That's fine for
  a small internal admin tool; swap in a proper session store if you need
  server-side revocation.
- This app ships with a single shared admin password by design (simple,
  self-hosted). If you need per-user accounts and roles, that's a natural
  next step.

## Deploying

This is a standard Next.js app — `npm run build && npm run start`, or deploy
to any Node.js host. Just make sure `data/` is on persistent, writable
storage (not an ephemeral filesystem), and set `ADMIN_PASSWORD` and
`SESSION_SECRET` in your hosting environment.
