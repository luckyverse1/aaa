# Trade Levels

A private, group-based trading price-level consensus app built with React + Vite + Supabase.

---

## Stack

| Layer     | Tech                         |
|-----------|------------------------------|
| Frontend  | React 19 + TypeScript + Vite |
| Styling   | Tailwind CSS v4              |
| Backend   | Supabase (Auth + DB + Storage) |
| Realtime  | Supabase Postgres Changes    |
| Hosting   | Vercel (recommended)         |

---

## Step 1 — Run the SQL migration

> **Do this ONCE before the first launch.**

1. Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/effkytwpxakseqtklool/sql/new)
2. Click **"New Query"**
3. Copy the entire contents of **`supabase/migrations.sql`** and paste it in
4. Click **"Run"**

You should see a success message. This creates all tables, indexes, RLS policies, and the private storage bucket.

---

## Step 2 — Run locally

```bash
npm install
npm run dev
```

App opens at `http://localhost:5173`

---

## Step 3 — Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite.

### Option B — GitHub import

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo
4. Framework preset: **Vite**
5. Output directory: `dist` (auto-detected)
6. Click **Deploy**

No environment variables needed — the Supabase URL and anon key are hardcoded (they are safe to expose publicly).

---

## Features

### Auth
- Email + password sign up / sign in
- Session persisted in `localStorage` — survives page refresh
- Automatic token refresh

### Groups
- Create a group → become admin → get invite code
- Join via 6-character invite code
- Max 50 members per group
- All data is scoped to your group via RLS

### Leaderboard
- Submit price levels (Long or Short)
- Same price + direction in same group → old level overridden
- Creator gets automatic first like
- Sorted by score (likes − dislikes), then most recent interaction
- Live updates via Supabase Realtime

### Voting
- Like or dislike each level (one vote per user per level)
- Tap same vote again → removes vote
- Switch between like/dislike freely
- Optional tag (max 2 words) on every vote

### Tags
- Aggregate across all votes and level submissions
- Top 3 shown on leaderboard cards
- Full list in detail view

### Admin controls (group creator only)
- **Tapped ✓** — level hit the price (win)
- **Failed ✗** — level did not work (loss)
- Pressing either removes the level from the leaderboard and archives it

### Previous Levels
- Shows outcome badge (Tapped / Failed)
- Click any card to open detail view
- Upload chart images (stored in private Supabase Storage, served via signed URLs)
- Add text notes
- Full tag list visible

### Profile
- Username, admin badge
- Win / Loss / Win % stats (based on your own submitted levels)
- Group name, member count, invite code (click to copy)
- Sign out

---

## Database Schema

```
profiles          → linked to auth.users
groups            → invite_code, admin_id, member_count ≤ 50
group_members     → group_id + user_id (unique)
levels            → price, direction, likes, dislikes, score, last_interaction_at
votes             → level_id + user_id unique, vote_type: like|dislike
tags              → normalized text, unique
level_tags        → level_id + tag_id + count (incremented per vote)
archived_levels   → snapshot of level at archiving time
archived_level_tags → tag snapshot (tag_text + count) per archived level
level_uploads     → image_path (storage) + body (notes) per archived level
```

Storage bucket: `level-uploads` (private, 10 MB limit per file)

---

## RLS Summary

- Users can only see levels, archives, and uploads for groups they belong to
- Votes are only readable/writable by the vote owner
- Profiles are publicly readable (needed for username joins)
- Storage objects are readable/writable by authenticated users only

---

## Local dev with Supabase local stack (optional)

```bash
npm install -g supabase
supabase init
supabase start
# Update src/lib/supabase.ts with local URL + anon key from `supabase status`
supabase db push  # or paste migrations.sql into local SQL editor
```
