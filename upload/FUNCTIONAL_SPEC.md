# StillHere — Functional Specification

A functional map of the app as it exists today, without visual or styling details. Use this as a requirements doc when redesigning with another model.

---

## Product purpose

**StillHere** is a digital memorial platform. A family member (the **owner**) creates and manages one or more memorial pages for someone who has passed. Each memorial gets a permanent public URL and a printable QR code. Visitors can view the page without logging in, leave lightweight tributes, and submit guestbook messages that the owner must approve before they appear.

There is no billing, no teams, and no multi-owner collaboration on a single memorial.

---

## User roles

| Role | Who | Capabilities |
|------|-----|--------------|
| **Owner** | Authenticated Supabase user | Create/edit/delete memorials; upload media; moderate guestbook; manage timeline, videos, song |
| **Visitor** | Anyone, unauthenticated | View public memorial; leave candle/flower tributes; submit guestbook messages (pending approval); share the page |
| **Anonymous** | Same as visitor | No account required for public interactions |

---

## Routes and pages

| Route | Auth | Purpose |
|-------|------|---------|
| `/` | Public | Marketing landing page; CTA goes to `/signup` or `/dashboard` depending on session |
| `/login` | Public | Email/password sign-in; supports `?redirect=` and `?check=1` (post-signup email confirmation notice) |
| `/signup` | Public | Account creation (min 8-char password) |
| `/dashboard` | Required | List of owner's memorials |
| `/dashboard/new` | Required | Create memorial form |
| `/dashboard/memorials/[id]` | Required | Full edit/moderation hub for one memorial |
| `/memorial/[slug]` | Public | Public memorial page (slug is unique, human-readable) |
| `/memorial/[slug]/opengraph-image` | Public | Dynamically generated OG/social share image |
| 404 | Public | Generic not-found page |

**Auth protection:** `/dashboard/*` redirects unauthenticated users to `/login?redirect=…`. Session refresh runs on every navigation via middleware/proxy.

---

## Authentication

- **Provider:** Supabase Auth (email + password)
- **Sign up:** Creates account; if email confirmation is enabled in Supabase, redirects to `/login?check=1` with no session
- **Sign in:** Redirects to `redirect` param if it starts with `/`, else `/dashboard`
- **Sign out:** Clears session, redirects to `/`
- **No:** OAuth, password reset UI, profile editing, or role tiers

---

## Data model

### `memorials` (core record)

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | FK → `auth.users`; owner |
| `slug` | text, unique | Auto-generated, not user-editable |
| `name` | text, required | Deceased person's full name |
| `dob` | date, optional | Date of birth |
| `dod` | date, optional | Date of passing |
| `tagline` | text, optional | Short descriptor |
| `bio` | text (HTML), optional | Rich-text life story |
| `cover_photo_url` | text, optional | Hero/cover image URL |
| `resting_place` | text, optional | e.g. cemetery name/location |
| `song_url` | text, optional | Uploaded audio file URL |
| `song_embed_url` | text, optional | Spotify/Apple Music embed URL |
| `song_title` | text, optional | Display title |
| `song_artist` | text, optional | Display artist |
| `created_at` | timestamptz | |

**Slug generation:** `{slugified-name}-{birth-year}-{death-year}` (e.g. `john-doe-1942-2021`). On collision, appends random suffix (up to 6 attempts).

### `photos`

Gallery images belonging to a memorial.

| Field | Notes |
|-------|-------|
| `memorial_id` | FK, cascade delete |
| `url` | Public storage URL |
| `sort_order` | Integer; defines display order |

### `videos`

Embedded video tributes.

| Field | Notes |
|-------|-------|
| `memorial_id` | FK |
| `embed_url` | Normalized YouTube/Vimeo embed URL |
| `title` | Optional label |

### `guestbook_entries`

| Field | Notes |
|-------|-------|
| `memorial_id` | FK |
| `visitor_name` | Required |
| `message` | Required, max 2000 chars on submit |
| `approved` | Boolean, default `false` |

**Workflow:** All new entries start unapproved. Only approved entries are visible on the public page. Owner sees all entries in dashboard.

### `tributes`

One-tap visitor gestures.

| Field | Notes |
|-------|-------|
| `memorial_id` | FK |
| `kind` | `"candle"` or `"flower"` |
| `visitor_name` | Optional, max 60 chars |
| `note` | Optional, max 140 chars |

No moderation — tributes appear immediately. Owner can delete via RLS but there is **no dashboard UI** for tribute management today.

### `timeline_events`

Optional life milestones.

| Field | Notes |
|-------|-------|
| `memorial_id` | FK |
| `event_date` | Optional date |
| `title` | Required, max 160 chars |
| `description` | Optional, max 600 chars |

Sorted by `event_date` ascending (nulls last), then `created_at`.

---

## Storage

- **Bucket:** `memorial-media` (public read)
- **Path pattern:** `{user_id}/{memorial_id}/{type}-{uuid}.{ext}`
  - Cover: `cover-{timestamp}.{ext}`
  - Gallery: `gallery-{uuid}.{ext}`
  - Song: `song-{uuid}.{ext}`
- **RLS:** Only authenticated owner can write/delete files under their own `user_id` folder
- **Deletion:** Removing a photo or uploaded song also removes the storage object

---

## Owner dashboard features

### Memorial list (`/dashboard`)

- Shows all memorials for the logged-in user, newest first
- Each card: name, date range, tagline, cover thumbnail, slug path
- Empty state with link to create first memorial
- **+ New memorial** → `/dashboard/new`

### Create memorial (`/dashboard/new`)

Form fields:

- Full name (required)
- Date of birth (optional)
- Date of passing (optional)
- Tagline (optional)
- Resting place (optional)
- Cover photo (optional file upload)
- Bio — rich text (optional)

On success: creates record, uploads cover if provided (non-fatal if cover fails), redirects to edit page with `?created=1`.

### Edit memorial (`/dashboard/memorials/[id]`)

Organized into sections:

#### 1. Share & QR code

- Displays public URL: `/memorial/{slug}`
- Server-generated QR code (PNG data URL) pointing to public URL
- **Download PNG** and **Copy link** actions

#### 2. Details

Same fields as create form. Edit mode saves in place (no redirect). Shows transient "Saved" confirmation.

**Rich text editor (Tiptap):** Bold, italic, H2, H3, blockquote, bullet list, numbered list. Output stored as HTML.

#### 3. Life timeline (collapsible)

- Add event: optional date, required title, optional description
- List existing events with remove action
- No edit-in-place — only add and delete

#### 4. Photo gallery (collapsible)

- Multi-file upload (`image/*`)
- Reorder via move earlier/later buttons (updates `sort_order`)
- Delete individual photos (removes DB row + storage file)
- Shows count

#### 5. Favourite song (collapsible)

Two input modes (streaming takes priority over upload):

- **Spotify or Apple Music link** → normalized to embed URL
- **Audio file upload** (`audio/*`) + optional title and artist
- Preview of current song (embed iframe or `<audio>` player)
- Save and Remove actions

Supported Spotify types: track, album, playlist, artist, episode, show.

#### 6. Video tributes (collapsible)

- Add: paste YouTube or Vimeo URL + optional title
- URLs normalized to embed format
- List with remove action

#### 7. Guestbook moderation (collapsible; auto-opens if pending messages exist)

- **Awaiting approval:** list with Approve and Delete per entry
- **Published:** list with Delete only
- Counts shown in section description

#### 8. Danger zone

- Delete entire memorial (cascade deletes photos, videos, guestbook, tributes, timeline; redirects to dashboard)

**Link:** "View public page" opens `/memorial/{slug}` in new tab.

---

## Public memorial page (`/memorial/[slug]`)

Fetched server-side by slug. Returns 404 if not found. **No login required.**

### Content sections (shown only when data exists, except guestbook and tributes)

1. **Hero**
   - Cover photo (if set)
   - "In loving memory of" label
   - Name (primary heading)
   - Birth and death dates (long format, e.g. "3 May 1942 — 15 June 2021")
   - Tagline (optional)
   - Resting place (optional, prefixed "Resting at …")
   - Sticky nav bar appears after scrolling past ~72% of viewport height; shows deceased's name

2. **Tributes bar**
   - Candle button with live count
   - Flower button with live count
   - Optional name field (60 chars) and note field (140 chars) — blank = anonymous
   - Optimistic UI: count increments immediately; tribute added to local feed
   - **Recently lit feed:** up to 3 most recent tributes with kind, name ("Someone" if anonymous), note, relative timestamp

3. **Biography** — rendered HTML from owner's bio (via `dangerouslySetInnerHTML`; owner-only authored content)

4. **Life timeline** — chronological list of events with date, title, description

5. **Photo gallery**
   - Carousel: one photo at a time with dot navigation
   - Tap/click opens fullscreen lightbox
   - Lightbox: prev/next, keyboard arrows, swipe on touch, Escape to close

6. **Favourite song**
   - Spotify/Apple embed iframe, OR native audio player with title/artist

7. **Video tributes**
   - Grid of embedded iframes (YouTube/Vimeo) with optional captions

8. **Guestbook**
   - Approved messages listed (newest first): message + visitor name
   - Empty state copy if none approved
   - Collapsible submission form: name (required, 120 chars), message (required, 2000 chars)
   - Success message explains approval is required before publication

9. **Share**
   - WhatsApp share link
   - Facebook share link
   - Copy link to clipboard
   - Native Web Share API attempted on WhatsApp tap where supported

10. **Footer**
    - Brand wordmark + link back to homepage to create a memorial

### Metadata & SEO

- Page title: `{name} ({year range})` or name alone
- Description: tagline or fallback "In loving memory of {name}"
- Open Graph type: `profile`
- Twitter card: `summary_large_image`
- Dynamic OG image at `/memorial/[slug]/opengraph-image`: cover photo, name, dates, brand wordmark

---

## Server actions (API surface)

All mutations are Next.js Server Actions — no REST API routes.

### Auth (`src/app/(auth)/actions.ts`)

- `login`, `signup`, `signOut`

### Memorials (`src/lib/actions/memorials.ts`)

- `createMemorial`, `updateMemorial`, `deleteMemorial`
- `addPhotos`, `deletePhoto`, `reorderPhotos`
- `addVideo`, `deleteVideo`
- `setSong`, `removeSong`
- `approveEntry`, `deleteEntry`

### Guestbook (`src/lib/actions/guestbook.ts`)

- `submitGuestbookEntry` — public, no auth

### Tributes (`src/lib/actions/tributes.ts`)

- `leaveTribute` — public, no auth

### Timeline (`src/lib/actions/timeline.ts`)

- `addTimelineEvent`, `deleteTimelineEvent`

**Cache invalidation:** Actions call `revalidatePath` on affected dashboard and public memorial routes after mutations.

---

## External integrations

| Service | Purpose | Required? |
|---------|---------|-----------|
| **Supabase Auth** | User accounts | Yes |
| **Supabase Postgres** | All data | Yes |
| **Supabase Storage** | Images + audio | Yes |
| **Resend** | Email notifications | Optional |
| **YouTube / Vimeo** | Video embeds | Optional (owner-provided URLs) |
| **Spotify / Apple Music** | Song embeds | Optional |
| **QR code generation** | Server-side via `qrcode` npm package | Built-in |

### Email notifications (optional)

When a guestbook entry is submitted, if all three env vars are set:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NOTIFY_FROM_EMAIL`

…the owner receives an email with visitor name, message excerpt (400 chars), and link to dashboard. Failures are silent; submission always succeeds.

---

## Security model (Row Level Security)

| Table | Read | Write |
|-------|------|-------|
| `memorials` | Public | Owner only (insert/update/delete) |
| `photos`, `videos`, `timeline_events` | Public | Owner only |
| `guestbook_entries` | Approved entries public; owner sees all | Anyone can insert (always `approved=false`); owner can update/delete |
| `tributes` | Public | Anyone can insert; owner can delete |
| Storage | Public read | Authenticated owner, own folder only |

Helper function `owns_memorial(id)` checks `auth.uid() = memorial.user_id`.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `NEXT_PUBLIC_SITE_URL` | Base URL for QR codes, OG tags, email links |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client for email lookup (server only) |
| `RESEND_API_KEY` | Outbound email |
| `NOTIFY_FROM_EMAIL` | Verified sender address |

---

## Tech stack (implementation, not design)

- **Framework:** Next.js 16 App Router, React 19, TypeScript
- **Backend:** Supabase (Auth, Postgres, Storage)
- **Rich text:** Tiptap (StarterKit)
- **Forms:** Server Actions + `useActionState`
- **Client uploads:** Direct to Supabase Storage from browser, then server action to insert DB rows
- **Deployment target:** Vercel

---

## Features explicitly NOT present

Useful boundaries for a redesign scope:

- No user-editable slug or custom domain
- No memorial privacy toggle (all memorials are public once created)
- No co-owners or family invite system
- No visitor photo uploads (was removed from schema)
- No tribute moderation UI (tributes are instant and permanent from visitor side)
- No editing timeline events or guestbook entries after creation
- No password reset or account settings page
- No analytics/view counts
- No comments on individual photos
- No search or discovery of memorials
- No admin/superuser panel
- No i18n / localization
- No offline/PWA support

---

## Key user flows (for wireframing)

```
Owner: Sign up → Create memorial (name + basics) → Edit page → Add photos/videos/timeline/song
       → Download QR → Share link → Moderate guestbook as messages arrive

Visitor: Scan QR or open link → Read story → Leave candle/flower → Write guestbook message
         → Share on WhatsApp/Facebook
```

---

## Content validation summary

| Input | Limits / rules |
|-------|----------------|
| Memorial name | Required |
| Password | Min 8 chars on signup |
| Guestbook message | Required, max 2000 chars |
| Guestbook name | Required, max 120 chars |
| Tribute name | Optional, max 60 chars |
| Tribute note | Optional, max 140 chars |
| Timeline title | Required, max 160 chars |
| Timeline description | Optional, max 600 chars |
| Video URL | Must parse as YouTube or Vimeo |
| Song link | Must parse as Spotify or Apple Music |
| Bio | HTML from Tiptap; rendered unsanitized (owner-trusted) |
