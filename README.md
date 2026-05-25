# Alt+Shift — AI cover letters

A small HR-tech app that motivates job seekers to write **at least 5 cover
letters** by streamlining the generation flow with AI and tracking progress
toward the goal.

> Reference: [Variant Group React Developer Test Assignment](https://variantnet.notion.site/React-Developer-Test-Assignment-Variant-Group-d7a1e3460dc643958eb57a0518ce84b2).

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: leave OPENAI_API_KEY empty to use the built-in mock
npm run dev                   # http://localhost:3000
```

Useful scripts:

| Script              | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Next.js dev server with hot reload        |
| `npm run build`     | Production build                          |
| `npm run start`     | Run the production build                  |
| `npm run typecheck` | `tsc --noEmit` over the whole project     |
| `npm run lint`      | ESLint (`next/core-web-vitals` + TS)      |
| `npm test`          | Vitest + Testing Library (jsdom)          |

## Stack

- **Next.js 15 (App Router) + React 19 + TypeScript** — gives us file-based
  routing on the client and a single backend route for the AI proxy without a
  separate server.
- **CSS Modules + design tokens in `:root` CSS variables** — small footprint,
  no runtime cost, zero classname collisions, and trivial to swap a theme.
  No Tailwind, as preferred by the brief.
- **Custom SVG icons** — bundled brand assets under `public/*.svg`, rendered via
  the local `<Icon>` component. Monochrome icons use CSS `mask-image` so they
  inherit `currentColor` from the surrounding text.
- **`localStorage` with a versioned schema** for persistence — no backend
  required, survives reloads, works offline.
- **`openai`** SDK for streaming completions (server-side only).
- **Vitest + Testing Library** for basic unit/component coverage.

## Project structure

```
src/
├── app/
│   ├── api/generate/route.ts  # AI proxy. OpenAI when key is set, mock otherwise.
│   ├── new/page.tsx           # Form + live preview screen
│   ├── page.tsx               # Dashboard
│   ├── layout.tsx             # Root layout, Inter font, LettersProvider
│   └── globals.css            # Resets + imports design tokens
├── components/
│   ├── ui/                    # Primitives (Button, Input, Logo, ConfirmDialog, …)
│   ├── layout/                # AppHeader, PageContainer
│   └── letters/               # Domain: LetterCard, LetterForm,
│                              # LetterPreview, GoalBanner, EmptyState
├── lib/
│   ├── ai/                    # client.ts (callback API), mock.ts (text builder),
│   │                          # prompt.ts (system + user prompts)
│   ├── letters/               # LettersContext — single source of truth
│   ├── hooks/                 # useLetters, useCopyToClipboard
│   ├── storage/letters.ts     # Versioned localStorage adapter
│   ├── cx.ts                  # className combiner
│   ├── constants.ts
│   └── types.ts
└── styles/tokens.css          # Colors, spacing, radii, typography

tests/
├── setup.ts
├── useLetters.test.tsx        # round-trip + hydration race regression
└── LetterCard.test.tsx        # render + ConfirmDialog flow
```

## Decision log

### Stack — Next.js 15 App Router
Picked over Vite-SPA because the brief asks for a real AI integration and
shipping an OpenAI key to the browser is unacceptable. With Next.js the
`/api/generate` route streams from OpenAI server-side; the client just reads
plain-text chunks. As a bonus we get static prerender for `/` and `/new`.

### Styling — CSS Modules + CSS variables
The brief discourages Tailwind. I wanted "design tokens as the API of the
visual system" without a CSS-in-JS runtime, so I went with CSS variables in
`src/styles/tokens.css` and CSS Modules per component. Components reference
tokens like `var(--space-4)` instead of magic numbers, which makes a future
dark theme or a tighter density mode a one-file change.

### Component layering
Three layers, sorted by domain coupling:

1. `components/ui/*` — primitives (Button, IconButton, Input, Textarea, Logo,
   ProgressDots). Zero domain knowledge.
2. `components/layout/*` — page chrome (AppHeader, PageContainer). Knows
   about the goal constant, nothing else.
3. `components/letters/*` — domain (LetterCard, LetterForm, LetterPreview,
   GoalBanner, EmptyState).

`Button` exposes a `buttonClassName()` helper that's reused by `ButtonLink`
(a styled Next.js `<Link>`). This avoids the `<a><button/></a>` antipattern
that breaks accessibility and HTML validation.

### AI — server-only with a callback client
`generateCoverLetter(input, { signal, onChunk }): Promise<string>` is a
plain async function: it returns the final letter and forwards every text
chunk to `onChunk` as it arrives so the UI can render progressively. No
async generators in our code — the public surface is a single callback,
which is easier to read, easier to test, and trivial to inline.

The server route uses the official `openai` SDK when `OPENAI_API_KEY` is
present and falls back to a deterministic mock when it isn't. Hard
failures (validation, auth, quota) return JSON `{ error: ... }` with the
right status code so the client can surface them in the UI. The previous
"silently swap in the mock on failure" behaviour was removed — it hid
real problems from the user.

### Persistence — versioned localStorage
The storage key is `alt-shift:letters:v1`. Payload is wrapped in a
`{ version: 1, letters: [...] }` envelope. If we ever need to migrate, we
bump the key and write a one-shot migration; bad payloads (corrupted JSON,
wrong shape) fail closed to "empty list" instead of crashing the dashboard.

`useLetters` hydrates once on mount, then persists every mutation behind a
`hydrated` flag included in the effect deps — so the initial render with
an empty placeholder array never gets a chance to overwrite stored data
in the first commit (an easy-to-miss race I caught after the first pass).

The hook is mounted **once** at the root via `<LettersProvider>` so all
pages share the same in-memory list — the dashboard and the form can't
diverge and there's only ever a single hydration round-trip.

### "Try Again" semantics
The first successful generation creates a new letter. Subsequent regenerations
in the same session **overwrite** that letter instead of appending — otherwise
a quick experimentation session would flood the dashboard with discarded
drafts. Once the user leaves `/new`, the session ID is dropped and the next
visit starts a fresh letter.

### Empty state
Since the brief leaves this to designer discretion, I rendered a dashed-border
"empty card" with the same brand-mint accent as the goal banner, a Sparkles
icon, and a primary CTA pointing to `/new`. The copy reinforces the 5-letter
goal so the motivation hook still lands even before the first letter exists.

### Mobile
- Header: progress text hides under 640px; only the dots + home icon remain.
- Dashboard grid collapses to a single column under 720px.
- `/new` form and preview stack vertically under 880px so the form fields
  never get pinched.
- Form's two-column row (job title / company) collapses under 540px.

### Accessibility notes
- All interactive controls have visible focus rings.
- The progress dots use `role="img"` + `aria-label` so screen readers hear
  "3 of 5 applications generated" instead of decorative dots.
- The preview region is wrapped in `aria-live="polite"` so the result is
  announced when generation finishes.
- Form fields use `aria-describedby` for errors / hints, `aria-invalid` for
  validation state, and explicit `<label htmlFor>` associations.
- The destructive `Delete` uses a custom `<ConfirmDialog>` primitive
  (portal, focus management, Esc / backdrop close, scroll lock) instead of
  the native `confirm()` — consistent with the design system and accessible.
- All running animations respect `prefers-reduced-motion: reduce`.

### What I'd add next
- Drawer/modal to **view** a letter in full from the dashboard (preview is
  truncated to 4 lines today).
- Edit-in-place for already generated letters.
- A small toast system instead of "Copied!" inline labels.
- Pagination or virtualization once letters exceed ~50.
- E2E test of the create-letter happy path (Playwright).
- Prettier + EditorConfig (skipped in this pass).
- Retry-with-backoff on OpenAI `429` / `5xx`.

## AI workflow notes

I used **Cursor + Claude** for the whole build:

- The **design-system layer** (tokens, Button/Input/Textarea primitives,
  ConfirmDialog, layout) is essentially mine: I planned the API surfaces
  and naming up front, and the model filled in CSS once the structure was
  set.
- The first pass had a hand-rolled OpenAI SSE parser in `route.ts`. I
  killed it in the second pass and swapped to the official `openai` SDK
  iteration — −25 lines of brittle code, +1 dep, fewer footguns.
- The **mock letter** is now a plain `buildMockLetter(input): string` and
  the route handles the "feels like a real model" chunking. Splitting the
  data from the streaming made the mock trivially testable.
- The piece I'm most proud of is the **`useLetters` + storage envelope**:
  small surface, robust against bad payloads, ready for migrations, and
  hydration-safe. After review I caught a latent race condition in the
  first version (a `useRef` "guard" that wasn't actually preventing the
  initial commit from writing back an empty array) and locked it down with
  a regression test in `tests/useLetters.test.tsx`.
- Where I had to **push back on the model**: it kept wanting to render
  `<Link>` around `<Button>`. I refactored to expose a `buttonClassName()`
  helper + a `ButtonLink` component so semantics stay clean. Same pattern
  again for the home icon in the header.
- Once the first version was working end-to-end I did a deliberate
  **KISS/anti-bloat pass**: removed dead `useLetters` methods (`upsert`,
  `get`), dropped a `crypto.randomUUID` fallback that targeted browsers
  no one cares about anymore, trimmed unused fields from `Letter`, killed
  silent fallback paths, and replaced all async generators with a single
  callback-style API. Boring but high-ROI.

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, "New Project" → import the repo. The default Next.js settings
   work out of the box.
3. (Optional) add `OPENAI_API_KEY` and `OPENAI_MODEL` as environment
   variables. Without them, the deployed app uses the built-in mock
   generator and is still fully demoable.
