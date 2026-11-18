# PROJECT_STATE.md

## Project overview

- Name: CalligrapheWrite
- Purpose: A local-first web app that converts pasted text into realistic handwritten pages, with paper, ink, pen, spacing and imperfection controls, a preloaded or personal handwriting profile, an editor, PDF and PNG export, and editing of existing handwritten PDFs.
- Constraints: No mandatory backend, authentication, MongoDB, Firebase, Cloudinary, paid APIs or cloud AI. Must run locally and deploy as a static site.
- Repository: GitHub (https://github.com/pradeepkumar673/calibre-text-to-handwriting), branch master.
- Developer machine: Windows. Local folder name: `calibre text to handwriting`.

## Technology stack

- Planned: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Zustand, HTML Canvas API, SVG, Konva.js, PDF.js, pdf-lib, KaTeX, IndexedDB, Web Workers, OpenCV.js.
- Installed (from package-lock.json):
  - react 18.3.1, react-dom 18.3.1
  - react-router 7.18.5 (imported from 'react-router')
  - zustand 5.1.0
  - tailwindcss 3.4.19, tailwindcss-animate 1.0.7, PostCSS, Autoprefixer
  - tailwind-merge 3.7.0
  - lucide-react 1.74.0
  - @radix-ui/react-dialog 1.3.1 (plus other Radix primitives installed by the shadcn CLI)
  - class-variance-authority, clsx
  - vite 6.4.6
  - typescript 5.9.3 (strict)
  - eslint 9 (flat config with typescript-eslint, react-hooks and react-refresh), prettier 3
  - @types/node 26.6.6
  - Test tooling: vitest 3.2.7, jsdom 26.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @playwright/test 1.65.1, fake-indexeddb 6.2.8 (dev)
  - Persistence: idb 8.0.4 (runtime)
- Not yet installed: Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. Deferred to later phases.

## Current architecture and folder structure

```
calibre text to handwriting/   (project root)
  index.html               (inline pre-paint theme script in head)
  package.json, package-lock.json, tsconfig.json, vite.config.ts (Vitest config, test.include tests/**),
  eslint.config.js, tailwind.config.ts, postcss.config.js, components.json,
  playwright.config.ts, .prettierrc, .prettierignore, .gitignore, README.md
  src/
    main.tsx                 (renders RouterProvider with the router)
    index.css                (Tailwind directives, shadcn tokens, color-scheme per theme, reduced-motion rule)
    vite-env.d.ts
    app/
      App.tsx                (renders AppShell)
      router.tsx             (exports appRoutes and the browser router built from it)
      NotFoundPage.tsx
    engine/                  (must not import React; enforced by ESLint rule)
      index.ts
      model/
        createDocument.ts    (IdFactory, createIdFactory, seedFromId, computeWordBoundaries, createTextRun, createDocument, DEFAULT_DOCUMENT_SETTINGS)
        serialize.ts         (serializeDocument, parseDocument, DocumentFormatError, UnsupportedSchemaVersionError)
    lib/
      utils.ts, icons.ts, navItems.ts
      db/
        database.ts          (DB_NAME, DB_VERSION=1, OBJECT_STORES, MIGRATIONS, runMigrations, createDatabaseHandle)
        errors.ts            (StorageError, StorageErrorCode, toStorageError)
        repositories/
          validation.ts      (invalidRecord, requireEnvelope, requireString, requireNumber, requireOneOf, requireIsoTimestamp)
          createRepository.ts (generic RecordRepository: get, put, delete, list, queryByUpdatedAt)
          documentRepository.ts  (documents store, validated with parseDocument)
          templateRepository.ts  (templates store, PaperTemplateRecord)
          profileRepository.ts   (profiles store, HandwritingProfileRecord)
          assetRepository.ts     (assets store, AssetRecord with Blob)
          index.ts           (createRepositories(handle), AppRepositories)
    types/
      index.ts               (re-exports ui, document and records types)
      ui.ts                  (UI slice state, actions, Toast types)
      document.ts            (DocumentModel, DocumentPage, DocumentElement union, DocumentSettings, schemaVersion 1)
      records.ts             (StoredRecord, PaperTemplateRecord, HandwritingProfileRecord, AssetRecord, PAPER_RULINGS)
    store/
      index.ts, uiStore.ts, themeStore.ts
    components/
      ui/                    (shadcn/ui owned source files)
      layout/                (AppShell, Header, SideNav, MobileDrawer)
      EmptyState.tsx
    features/
      home/, generator/, editor/, profiles/, paper/, pdf/, templates/, settings/
    workers/                 (empty, reserved for Web Workers)
    assets/                  (empty)
  tests/
    setup.ts                 (matchMedia stub, Testing Library cleanup, Node Blob binding for fake-indexeddb)
    smoke/routes.test.tsx    (one test per route, 9 cases)
    unit/document-model.test.ts (15 cases)
    unit/db/repositories.test.ts (13 cases, includes localStorage check)
    unit/db/migration.test.ts    (3 cases: v1 to v2 keeps records, newer schema rejected, failed upgrade leaves data unchanged)
    e2e/navigation.spec.ts   (home to editor, Chromium)
  dist/                      (build output, gitignored)
```

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

Routes: / (HomePage), /generator, /editor, /profiles, /paper-designer, /pdf-tools, /templates, /settings, and * (404). All are children of the App shell. Each section page has exactly one h1.

Layout: CSS grid, rows auto and minmax(0,1fr), so the header is fixed and the content row scrolls. Desktop (768px and up): 15rem sidebar plus main when sidebarOpen is true, main only when false. Below 768px: single column, navigation in the drawer.

Theme: mode is light, dark or system. The inline script in index.html sets the "dark" class before first paint. Stored under localStorage key calligraphewrite-theme. This is the only localStorage use in the app.

Document model: DocumentModel holds schemaVersion (currently 1), id, title, createdAt, updatedAt, paperTemplateId, styleId, settings and pages. Elements are a discriminated union on `kind`. Positions are millimetres from the top-left of the page. Ids are random 96-bit hex strings from crypto.getRandomValues.

Persistence: IndexedDB database `calligraphewrite`, version 1, with four object stores (documents, templates, profiles, assets). Each store uses `id` as its key and has an `updatedAt` index. The database handle opens lazily, shares one connection, closes on a versionchange request from another tab, and retries after a failed open. All repository calls are async. Every failure is a StorageError with a code: unavailable, quota, version, upgrade, aborted, invalid or unknown. Records are validated on read and write. Assets are stored as Blobs. The persistence layer is not yet imported by any app screen.

## Last successfully completed prompt

- Prompt 9: Local persistence layer (verified, commit f58cb87)

## Prompt status

| Prompt | Title                                                          | Status    | Reason                                                                                                                                                                                                                                                                                                                                                                                     |
| ------ | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Project Setup and UI Foundation                                | Completed | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed.                                                                                                                                                                                                                                                                                                    |
| 2      | Install styling and UI kit                                     | Completed | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed. Committed as 8bc208f.                                                                                                                                                                                                                                                                 |
| 3      | Routing and global state scaffolding                           | Completed | react-router and zustand installed. Typecheck, lint, build passed. Browser checks passed. Committed as fcfdf57.                                                                                                                                                                                                                                                                            |
| 4      | Application layout and responsive navigation                   | Completed | Typecheck, lint, build passed. Responsive, focus trap, Escape, route-change close checks passed. Committed as 2c236f5.                                                                                                                                                                                                                                                                     |
| 5      | Theme management                                               | Completed | Typecheck, lint, build passed. Theme persistence, no-flash reload and OS-follow checks passed. Committed as 962ecb7.                                                                                                                                                                                                                                                                       |
| 6      | Placeholder pages and empty states                             | Completed | Typecheck, lint, build passed. Browser checks passed. Committed as cc1056a.                                                                                                                                                                                                                                                                                                                |
| 7      | Verification checkpoint 1: testing setup and foundation review | Completed | Developer pasted passing output: format:check, typecheck, lint, build, npm test (9 of 9), npm run test:e2e (1 of 1, Chromium). Committed as 640d62b.                                                                                                                                                                                                                                       |
| 8      | Document data model                                            | Completed | Developer pasted passing output: format:check, typecheck, lint, npm test (24 of 24), build (CSS 23.70 kB, JS 394.55 kB). Committed as c24f354.                                                                                                                                                                                                                                             |
| 9      | Local persistence layer                                        | Completed | Developer pasted passing output: npm install idb 8.0.4 and fake-indexeddb 6.2.8, format:check, typecheck, lint, npm test (40 of 40: 31 unit, 9 smoke), build (CSS 23.70 kB, JS 394.55 kB). Committed as f58cb87 and pushed to master. Build output identical to Prompt 8 is expected because no app screen imports the persistence layer yet. A second build run was requested to confirm. |

Housekeeping after Prompt 6 (not a numbered prompt): completed, commit e0492ab.

## Features implemented

- Prompt 1: Default scaffold, strict TypeScript, ESLint with engine-isolation rule, Prettier.
- Prompt 2: Tailwind utility classes and CSS design tokens. Dark-mode token set. shadcn/ui components generated as owned files.
- Prompt 3: Client-side routing for eight sections plus a 404 page. Zustand UI store with sidebar state, active route and toast queue.
- Prompt 4: Grid-based app shell with header, side navigation (visible from 768px), left-side Sheet drawer below 768px with focus trap and Escape. Header theme button is a placeholder.
- Prompt 5: Light, dark and system theme modes, persisted to localStorage. Settings page with Appearance card.
- Prompt 6: Home page with two working links. Seven section pages each show an h1, a purpose line and a disabled CTA with a note. Settings keeps the working Appearance card.
- Prompt 7: Vitest with jsdom and Testing Library, nine smoke tests (one per route), Playwright e2e test for home to editor in Chromium.
- Prompt 8: Document model types with a discriminated element union and schemaVersion 1. createDocument, createTextRun, computeWordBoundaries and seedFromId. JSON serialise and parse with schemaVersion check and structural validation.
- Prompt 9: IndexedDB repository layer with four object stores, lazy shared connection, migration runner, typed StorageError, validation on read and write, and get, put, delete, list and queryByUpdatedAt for every store. Assets stored as Blobs. Document records validated by the Prompt 8 parser. Not yet used by any screen.

## Files created

- Prompt 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files.
- Prompt 2 (commit 8bc208f): tailwind.config.ts, postcss.config.js, components.json, src/lib/utils.ts, src/lib/icons.ts, and 9 shadcn components in src/components/ui.
- Prompt 3 (commit fcfdf57): src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/app/router.tsx, src/app/NotFoundPage.tsx, src/components/PlaceholderPage.tsx.
- Prompt 4 (commit 2c236f5): src/components/ui/sheet.tsx, src/lib/navItems.ts, src/components/layout/AppShell.tsx, Header.tsx, SideNav.tsx, MobileDrawer.tsx.
- Prompt 5 (commit 962ecb7): src/store/themeStore.ts, src/features/settings/ThemeSelect.tsx, src/features/settings/SettingsPage.tsx.
- Prompt 6 (commit cc1056a): src/components/EmptyState.tsx, and seven feature pages under src/features.
- Prompt 7 (commit 640d62b): tests/setup.ts, tests/smoke/routes.test.tsx, tests/e2e/navigation.spec.ts, playwright.config.ts.
- Prompt 8 (commit c24f354): src/types/document.ts, src/engine/model/createDocument.ts, src/engine/model/serialize.ts, tests/unit/document-model.test.ts.
- Prompt 9 (commit f58cb87): src/types/records.ts, src/lib/db/errors.ts, src/lib/db/database.ts, src/lib/db/repositories/validation.ts, createRepository.ts, documentRepository.ts, templateRepository.ts, profileRepository.ts, assetRepository.ts, index.ts, tests/unit/db/repositories.test.ts, tests/unit/db/migration.test.ts.

## Files modified

- Prompt 2: src/index.css, src/app/App.tsx, tsconfig.json, vite.config.ts, eslint.config.js, package.json, package-lock.json.
- Prompt 3: src/main.tsx, src/app/App.tsx, src/types/index.ts, src/lib/icons.ts, package.json, package-lock.json.
- Prompt 4: src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/index.css, src/app/App.tsx, src/lib/icons.ts.
- Prompt 5: index.html, src/index.css, src/app/router.tsx.
- Prompt 6: src/app/router.tsx, src/features/settings/SettingsPage.tsx.
- Housekeeping (commit e0492ab): PROJECT_STATE.md (reformatted, versions corrected).
- Prompt 7 (commit 640d62b): src/app/router.tsx (exports appRoutes), vite.config.ts (Vitest block), tsconfig.json, eslint.config.js, .gitignore, .prettierignore, package.json, package-lock.json.
- Prompt 8 (commit c24f354): src/types/index.ts, vite.config.ts (test.include), PROJECT_STATE.md.
- Prompt 9 (commit f58cb87): src/types/index.ts (adds records re-export), package.json and package-lock.json (idb and fake-indexeddb added), tests/setup.ts (binds globalThis.Blob and window.Blob to Node's Blob for fake-indexeddb), src/lib/db/errors.ts (checks error.name directly so cross-realm DOMExceptions map correctly), src/lib/db/database.ts (transaction.done.catch handler during upgrade), src/lib/db/repositories/assetRepository.ts (Blob handling adjusted during debugging).

## Files deleted

- Prompt 6: src/components/PlaceholderPage.tsx.

## Latest results (as supplied by developer)

- Housekeeping (commit e0492ab): format:check PASS, typecheck PASS, lint PASS, build PASS (CSS 23.68 kB, JS 394.55 kB).
- Prompt 7 (commit 640d62b): format:check PASS, typecheck PASS, lint PASS, build PASS, npm test PASS (9 of 9), npm run test:e2e PASS (1 of 1, Chromium).
- Prompt 8 (commit c24f354): format:check PASS, typecheck PASS, lint PASS, npm test PASS (24 of 24), build PASS (CSS 23.70 kB, JS 394.55 kB).
- Prompt 9 (commit f58cb87): idb 8.0.4 and fake-indexeddb 6.2.8 installed. format:check PASS, typecheck PASS, lint PASS, npm test PASS (40 of 40: document-model 15, migration 3, repositories 13, routes 9), build PASS (CSS 23.70 kB, JS 394.55 kB). The first build attempt returned an API 502 error and was rerun.
- Prompts 1 to 6: as recorded in the Prompt status table above.

## Phase 1 foundation review

| #   | Item                                    | Status                                                   |
| --- | --------------------------------------- | -------------------------------------------------------- |
| 1   | Scaffold, strict TypeScript, Vite build | Pass (build re-verified in Prompts 7, 8 and 9)           |
| 2   | ESLint engine-isolation, Prettier       | Pass (lint and format re-verified in Prompts 7 to 9)     |
| 3   | Tailwind 3.4, PostCSS, shadcn/ui        | Pass (build re-verified in Prompts 7 to 9)               |
| 4   | Routing for 8 sections plus 404         | Pass (9 of 9 smoke tests)                                |
| 5   | Zustand UI and theme stores             | Pass (smoke tests load both stores)                      |
| 6   | Responsive app shell and navigation     | Pass (e2e navigation test, Chromium)                     |
| 7   | Light, dark and system theme            | Pass from Prompt 5 manual checks. No automated test yet. |
| 8   | Placeholder pages, one h1 each          | Pass (9 of 9 smoke tests)                                |
| 9   | Unit and smoke test tooling             | Pass (Prompts 7 to 9)                                    |
| 10  | E2E tooling (Playwright, Chromium)      | Pass (Prompt 7)                                          |

## Known bugs and unresolved issues

- Commit history: the Prompt 9 push went from `57457de` to `f58cb87`. Commit `57457de` and any commits between `c24f354` and `57457de` are not in the project record. Confirm with `git log --oneline -6`.
- Build verification: the Prompt 9 build output matches the Prompt 8 output byte for byte (same hashes and sizes). This is expected because the persistence code is not yet imported by any screen, but a second `npm run build` should be pasted to confirm the bundle is current.
- The database is at version 1 and has no real version 2 migration. The v1 to v2 test uses a migration defined inside the test file.
- The `blocking` handler closes the connection when another tab upgrades. Any repository call made afterwards reconnects. A connection request still pending when `close()` runs can leak its connection.
- A blocked upgrade (another tab holding the database open) is not reported as an error and can wait indefinitely.
- `transaction.done.catch` in database.ts silences the transaction promise during upgrades. The openDB rejection still reaches the caller, but any future upgrade logic should be checked for silent failures.
- tests/setup.ts binds globalThis.Blob to Node's Blob. This affects every test file, including the smoke tests. Re-check it if a browser-only Blob API is used in a test.
- errors.ts identifies DOMExceptions by error.name, not instanceof, because of cross-realm errors under jsdom. Any new error mapping should follow the same pattern.
- The updatedAt index depends on canonical ISO strings. Records written by other code paths must use toISOString(), or they are rejected.
- The validators check record shape but not business rules, such as whether a sample asset id exists in the assets store.
- No cross-store consistency: deleting an asset does not update profiles that reference it.
- E2E test runs in Chromium only. Firefox and WebKit are not configured.
- No automated tests for theme switching or responsive layout. Covered only by manual checks from Prompts 4 and 5.
- Tests in tests/ are included in tsconfig, so a type error in a test fails npm run build.
- Header theme button is a placeholder (from Prompt 4).
- Generated shadcn files (dialog.tsx, select.tsx, sheet.tsx) import icons from 'lucide-react' directly. Only in generated files.
- tailwind-merge 3.7.0 targets Tailwind v4 class names; project uses Tailwind 3.4. Possible mis-merging of a few classes.
- Tailwind scans all of src/, including .ts files. Strings such as 'table' and 'image' generate unused utility rules. Harmless, but keep an eye on CSS size.
- Deep links on a static host need an SPA fallback on the production host. Not configured yet.
- Vite base is './'. Decide base '/' or not when deploying to a domain root.
- Sidebar state and toasts are not persisted across reloads. Only the theme is persisted.
- node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI. Can be ignored.
- Prompts 2 to 9 were verified from written descriptions of browser output, not screenshots.
- Playwright's webServer rebuilds the app on every e2e run. This adds a few seconds.
- Image bytes are not yet wired to any feature. `assetId` references are unused until the asset-using features exist.

## Technical decisions and context

- Tailwind CSS v3.4, not v4, because the prompt requires tailwind.config.ts and a PostCSS config.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2). Do not run npx shadcn@latest.
- components.json was written by hand. Components are owned source files in src/components/ui.
- Icons are imported from src/lib/icons.ts only in app code.
- The engine folder remains protected from React imports. The persistence layer lives in src/lib/db, not in the engine, so it can use IndexedDB.
- Document types use plain TypeScript interfaces. The element union is discriminated on `kind`.
- The document type is named DocumentModel, not Document, to avoid shadowing the browser's Document type.
- Serialisation writes schemaVersion as a top-level field. parseDocument rejects a missing or different version.
- Ids come from an injectable IdFactory. The default uses crypto.getRandomValues, which works on plain-HTTP LAN addresses.
- Persistence uses the idb wrapper with its untyped API. Each repository validates values on read and write, so the validators are the type boundary.
- Record timestamps must be canonical ISO 8601 (toISOString output), so the updatedAt index sorts correctly.
- Assets are stored as Blobs. The asset validator checks blobs by duck typing (size and type), not instanceof, to avoid realm mismatches.
- Every repository failure goes through toStorageError. Errors carry a `code` and an `operation` name. Migration failures are reported as code 'upgrade', and an older build opening a newer database is reported as code 'version'.
- Migrations run in order inside the upgrade transaction. A throwing migration rolls the upgrade back, so existing data is unchanged.
- The database handle opens lazily, shares one connection, and retries after a failed open.
- The only localStorage use is the theme preference. A repository test asserts that repository operations write nothing to localStorage.
- Theme persistence uses a plain localStorage string, so the pre-paint script in index.html can read it. Key and values must match between index.html and src/store/themeStore.ts.
- vite.config.ts sets Vitest's test.include to tests/**/*.test.{ts,tsx}.
- jsdom has no matchMedia. tests/setup.ts provides a stub.
- Tests that use IndexedDB import 'fake-indexeddb/auto' and give each test its own database name.
- Prompts 2 to 9 were verified from written descriptions, not screenshots. Ask for a screenshot if a later prompt depends on exact layout or colour.

## Exact next prompt number

- 10 (Prompt 10 text has not been supplied in this chat. Paste its full text to begin.)

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
