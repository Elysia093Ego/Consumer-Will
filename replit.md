# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/news-site` (`@workspace/news-site`)

Chinese news website (React + Vite + Tailwind). Multi-page layout with warm cream background, dark nav, orange accents, and Chinese typography (Noto Sans SC).

- Pages: Home, CategoryPage (all topic sections), GongKaiXin, UBI, MoniShichang, ArticlePage (`/article/:id`)
- User article system: full-screen rich text editor (bold/italic/lists/headings/images), articles stored in PostgreSQL via API
- API calls: `fetch('/api/articles')` — proxied to API server in dev (Vite proxy), routed directly in production (Replit path routing)
- Routing: wouter (hash-free), all routes defined in `src/App.tsx`
- Storage: articles previously used localStorage; now use PostgreSQL via API server
- Language system: `LangContext` supports 4 languages (zh/en/ja/zh-tw) with dropdown in Header; `i18n/ui.ts` exports `t(key, lang)` for all UI strings; sub-components must call `useLang()` independently; `ArticlePage` has 3-mode `viewMode` state: zh / en / bilingual
- Japanese UI edit mode: admins can edit Japanese UI text via "edit page mode" (key: "Elysia"); overrides stored in `ui_translations` DB table; `EditModeContext` provides override state; `EditModePanel` shows floating editor panel; API: GET/PUT `/api/ui-translations`
- Article translation: `title_en` + `content_en` columns in DB; admin can fill via ArticleEditor "English" tab; bilingual mode shows two-column side-by-side layout
- Left sidebar (`LeftSocialSidebar`): social share buttons + 对照/英文/收藏 mode toggle; functional on ArticlePage, static on CategoryPage
- Article stats: `article_stats` table; view count auto-incremented, likes tracked with localStorage duplicate prevention
- User accounts: `site_users` table with sequential 11-digit `numeric_id` (zero-padded, supports up to 100 billion users), `avatar_url` stored as base64 data URL (max ~1.5MB, auto-cropped to 256x256 JPEG); avatar upload via profile page; profile API at `/api/auth/profile?userId=`
- Admin: password `ggwl528123`; admin-only create/edit/delete; ArticleEditor has rich-text toolbar + EN tab
- 登记合约: `dengji_records` table with full_name, birth_date, country; UNIQUE per user; 4-step DengjiPage flow
- Sidebar links: 10 categories seeded in DB; admin inline-edit on hover
- Bookmark/Save system: `user_follows` table (user_id, tag); users can save/unsave tags on article cards, category pages, and article pages; toggle shows "已收藏 ✓" state; profile page lists all saves as "我的收藏"
- Profile page (`/profile`): shows username, account info, dengji registration status, and saved tags list with remove buttons; accessible via clicking username in header
- Admin dashboard (`/admin`): shows aggregate stats (registered users, dengji records, articles, saves) with stat cards + recent registrations and dengji records lists; admin-only access via header "后台管理" link; API endpoint `/api/admin/stats` protected by `x-admin-password` header
- Favicon: background-removed PNG; tab title "共同体的意志"

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health`; `src/routes/articles.ts` exposes CRUD for user articles
- Article routes: `GET /api/articles[?category=X]`, `GET /api/articles/:id`, `POST /api/articles`, `PUT /api/articles/:id`, `DELETE /api/articles/:id`
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### DB Tables (API Server inline migrations)

- `user_articles` — articles with title/content/category/image, supports English translations
- `site_users` — user accounts with avatar, numeric_id, registered_at
- `dengji_records` — registration contract records
- `sidebar_links` — category sidebar links
- `article_stats` — article view/like counts
- `user_follows` — user tag/topic follows
- `open_letter_content` — open letter pages content (title/subtitle/content with EN translations)
- `page_content` — editable page content for homepage modules and placeholder pages (title/title_en/description/description_en/image_url/tag/tag_en/content/content_en)
- `milestone_pages` — admin-editable milestone pages for registration milestones (slug/title/title_en/content/content_en); slugs: 1qian, 100wan, 10yi
- `hero_slides` — homepage hero slideshow slides (kind/title/title_en/subtitle/subtitle_en/label/label_en/image_url/href/sort_order)

### Admin Editing System

- Admin password: stored in both frontend (`AdminAuthContext`) and backend route files
- Admin dashboard at `/admin` with tabs: data overview, hero slides management, user feedback management
- All editable pages use `ArticleEditor` component with Chinese/English tab support
- Open letters: `/api/open-letters/:id` (GET/PUT)
- Page content: `/api/page-content/:pageId` (GET/PUT), `/api/page-content-batch?ids=...` (GET) — stores title/description/image/tag/content with EN translations; homepage cards fetch batch overrides to reflect admin edits
- Hero slides: `/api/hero-slides` (GET/PUT) — homepage slideshow; falls back to hardcoded defaults when empty
- Milestones: `/api/milestones/:slug` (GET/PUT) — admin-editable milestone pages (1千/100万/10亿); linked from interactive cells in DengjiPage table
- Feedback: `/api/feedback` (POST public, GET/DELETE admin) — user feedback form at `/fankui`, requires login
- Admin presence: `/api/admin/heartbeat` (POST), `/api/admin/lock-article` (POST/DELETE) — in-memory admin session tracking with 10s heartbeat, article edit locking to prevent concurrent edits
- Auth header: `x-admin-password` for all admin PUT/GET/DELETE requests

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
