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
- No new packages in Prompt 10.
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
      index.ts               (re-exports the paper module)
      model/
        createDocument.ts    (IdFactory, createIdFactory, seedFromId, computeWordBoundaries, createTextRun, createDocument, DEFAULT_DOCUMENT_SETTINGS)
        serialize.ts         (serializeDocument, parseDocument, DocumentFormatError, UnsupportedSchemaVersionError)
      paper/
        types.ts             (PaperTemplate, RulingStyle, Margins, PixelLine, WritableArea, PaperLayout, PAPER_RULING_KINDS)
        errors.ts            (PaperGeometryError)
        presets.ts           (PAPER_PRESET_IDS, PAPER_PRESETS, getPreset: a4, a5, us-letter)
        geometry.ts          (DEFAULT_DPI=150, mmToPx, mmToPxExact, validateTemplate, writableAreaMm, writableAreaPx, sheetSizePx)
        rulings.ts           (rulingLines, buildPaperLayout)
    lib/
      utils.ts, icons.ts, navItems.ts
      db/
        database.ts          (DB_NAME, DB_VERSION=1, OBJECT_STORES, MIGRATIONS, runMigrations, createDatabaseHandle)
        errors.ts            (StorageError, StorageErrorCode, toStorageError)
        repositories/
          validation.ts, createRepository.ts, documentRepository.ts, templateRepository.ts,
          profileRepository.ts, assetRepository.ts, index.ts
    types/
      index.ts               (re-exports ui, document and records types)
      ui.ts, document.ts, records.ts
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
    unit/db/migration.test.ts    (3 cases)
    unit/paper/geometry.test.ts  (Prompt 10, 9 cases)
    unit/paper/rulings.test.ts   (Prompt 10, 11 cases)
    e2e/navigation.spec.ts   (home to editor, Chromium)
  dist/                      (build output, gitignored)
```

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

Routes: / (HomePage), /generator, /editor, /profiles, /paper-designer, /pdf-tools, /templates, /settings, and * (404). All are children of the App shell. Each section page has exactly one h1.

Layout: CSS grid, rows auto and minmax(0,1fr), so the header is fixed and the content row scrolls. Desktop (768px and up): 15rem sidebar plus main when sidebarOpen is true, main only when false. Below 768px: single column, navigation in the drawer.

Theme: mode is light, dark or system. The inline script in index.html sets the "dark" class before first paint. Stored under localStorage key calligraphewrite-theme. This is the only localStorage use in the app.

Document model: DocumentModel holds schemaVersion (currently 1), id, title, createdAt, updatedAt, paperTemplateId, styleId, settings and pages. Elements are a discriminated union on `kind`. Positions are millimetres from the top-left of the page. Ids are random 96-bit hex strings from crypto.getRandomValues.

Persistence: IndexedDB database `calligraphewrite`, version 1, with four object stores (documents, templates, profiles, assets). Each store uses `id` as its key and has an `updatedAt` index. The database handle opens lazily, shares one connection, closes on a versionchange request from another tab, and retries after a failed open. All repository calls are async. Every failure is a StorageError with a code: unavailable, quota, version, upgrade, aborted, invalid or unknown. Records are validated on read and write. Assets are stored as Blobs. The persistence layer is not yet imported by any app screen.

Paper geometry: pure functions in src/engine/paper with no canvas or DOM calls. Units are millimetres in the model and pixels after conversion at a DPI (default 150, px = round(mm / 25.4 * dpi)). Presets: A4 210x297 mm, A5 148x210 mm, US Letter 216x279 mm, each with 20 mm margins and 8 mm light-grey ruling. Ruling kinds: ruled, unruled, grid, margin. Rules start one pitch below the top margin and stop at the bottom margin. Invalid geometry throws PaperGeometryError.

## Last successfully completed prompt

- Prompt 9: Local persistence layer (verified, commit f58cb87; PROJECT_STATE.md recorded in commit 6d281e3)

## Prompt status

| Prompt | Title                                                          | Status       | Reason                                                                                                                                                                                                                               |
| ------ | -------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Project Setup and UI Foundation                                | Completed    | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed.                                                                                                                                              |
| 2      | Install styling and UI kit                                     | Completed    | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed. Committed as 8bc208f.                                                                                                           |
| 3      | Routing and global state scaffolding                           | Completed    | react-router and zustand installed. Typecheck, lint, build passed. Browser checks passed. Committed as fcfdf57.                                                                                                                      |
| 4      | Application layout and responsive navigation                   | Completed    | Typecheck, lint, build passed. Responsive, focus trap, Escape, route-change close checks passed. Committed as 2c236f5.                                                                                                               |
| 5      | Theme management                                               | Completed    | Typecheck, lint, build passed. Theme persistence, no-flash reload and OS-follow checks passed. Committed as 962ecb7.                                                                                                                 |
| 6      | Placeholder pages and empty states                             | Completed    | Typecheck, lint, build passed. Browser checks passed. Committed as cc1056a.                                                                                                                                                          |
| 7      | Verification checkpoint 1: testing setup and foundation review | Completed    | Developer pasted passing output: format:check, typecheck, lint, build, npm test (9 of 9), npm run test:e2e (1 of 1, Chromium). Committed as 640d62b.                                                                                 |
| 8      | Document data model                                            | Completed    | Developer pasted passing output: format:check, typecheck, lint, npm test (24 of 24), build (CSS 23.70 kB, JS 394.55 kB). Committed as c24f354.                                                                                       |
| 9      | Local persistence layer                                        | Completed    | Developer pasted passing output: npm install idb 8.0.4 and fake-indexeddb 6.2.8, format:check, typecheck, lint, npm test (40 of 40), build (CSS 23.70 kB, JS 394.55 kB). Committed as f58cb87. A second build gave identical output. |
| 10     | Paper template system                                          | Not Verified | Code generated: src/engine/paper (types, errors, presets, geometry, rulings), src/engine/index.ts re-export, and 2 test files (20 new tests). Awaiting developer output from format:check, typecheck, lint, npm test and build.      |

Housekeeping after Prompt 6 (not a numbered prompt): completed, commit e0492ab.

Note on status commits: `PROJECT_STATE.md` was updated to mark Prompts 7, 8 and 9 Completed in separate commits (fe48a9f, 57457de, 6d281e3), each before its verification was recorded in chat. Going forward, mark a prompt Completed only after the developer's passing output has been pasted, and update the file with that output.

## Features implemented

- Prompt 1: Default scaffold, strict TypeScript, ESLint with engine-isolation rule, Prettier.
- Prompt 2: Tailwind utility classes and CSS design tokens. Dark-mode token set. shadcn/ui components generated as owned files.
- Prompt 3: Client-side routing for eight sections plus a 404 page. Zustand UI store with sidebar state, active route and toast queue.
- Prompt 4: Grid-based app shell with header, side navigation (visible from 768px), left-side Sheet drawer below 768px with focus trap and Escape. Header theme button is a placeholder.
- Prompt 5: Light, dark and system theme modes, persisted to localStorage. Settings page with Appearance card.
- Prompt 6: Home page with two working links. Seven section pages each show an h1, a purpose line and a disabled CTA with a note. Settings keeps the working Appearance card.
- Prompt 7: Vitest with jsdom and Testing Library, nine smoke tests (one per route), Playwright e2e test for home to editor in Chromium.
- Prompt 8: Document model types with a discriminated element union and schemaVersion 1. createDocument, createTextRun, computeWordBoundaries and seedFromId. JSON serialise and parse with schemaVersion check and structural validation.
- Prompt 9: IndexedDB repository layer with four object stores, lazy shared connection, migration runner, typed StorageError, validation on read and write, and get, put, delete, list and queryByUpdatedAt for every store. Assets stored as Blobs. Not yet used by any screen.
- Prompt 10 (unverified): Pure paper geometry. Presets A4, A5 and US Letter. Millimetre to pixel conversion at a configurable DPI (default 150). Writable area in millimetres and pixels. Ruling lines for ruled, unruled, grid and margin styles, with configurable spacing, colour and stroke width. Full paper layout function for the renderer. Invalid geometry throws PaperGeometryError.

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
- Prompt 10 (unverified): src/engine/paper/types.ts, src/engine/paper/errors.ts, src/engine/paper/presets.ts, src/engine/paper/geometry.ts, src/engine/paper/rulings.ts, tests/unit/paper/geometry.test.ts, tests/unit/paper/rulings.test.ts.

## Files modified

- Prompt 2: src/index.css, src/app/App.tsx, tsconfig.json, vite.config.ts, eslint.config.js, package.json, package-lock.json.
- Prompt 3: src/main.tsx, src/app/App.tsx, src/types/index.ts, src/lib/icons.ts, package.json, package-lock.json.
- Prompt 4: src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/index.css, src/app/App.tsx, src/lib/icons.ts.
- Prompt 5: index.html, src/index.css, src/app/router.tsx.
- Prompt 6: src/app/router.tsx, src/features/settings/SettingsPage.tsx.
- Housekeeping (commit e0492ab): PROJECT_STATE.md (reformatted, versions corrected).
- Prompt 7 (commit 640d62b): src/app/router.tsx (exports appRoutes), vite.config.ts (Vitest block), tsconfig.json, eslint.config.js, .gitignore, .prettierignore, package.json, package-lock.json. Status update in fe48a9f.
- Prompt 8 (commit c24f354): src/types/index.ts, vite.config.ts (test.include). Status update in 57457de.
- Prompt 9 (commit f58cb87): src/types/index.ts, package.json and package-lock.json, tests/setup.ts, src/lib/db/errors.ts, src/lib/db/database.ts, src/lib/db/repositories/assetRepository.ts. Status update in 6d281e3.
- Prompt 10 (unverified): src/engine/index.ts (replaced: now re-exports the paper module; previously an empty placeholder).

## Files deleted

- Prompt 6: src/components/PlaceholderPage.tsx.

## Latest results (as supplied by developer)

- Housekeeping (commit e0492ab): format:check PASS, typecheck PASS, lint PASS, build PASS (CSS 23.68 kB, JS 394.55 kB).
- Prompt 7 (commit 640d62b): format:check PASS, typecheck PASS, lint PASS, build PASS, npm test PASS (9 of 9), npm run test:e2e PASS (1 of 1, Chromium).
- Prompt 8 (commit c24f354): format:check PASS, typecheck PASS, lint PASS, npm test PASS (24 of 24), build PASS (CSS 23.70 kB, JS 394.55 kB).
- Prompt 9 (commit f58cb87): idb 8.0.4 and fake-indexeddb 6.2.8 installed. format:check PASS, typecheck PASS, lint PASS, npm test PASS (40 of 40), build PASS (CSS 23.70 kB, JS 394.55 kB). Second build identical.
- Prompt 10: no output supplied yet.
- Prompts 1 to 6: as recorded in the Prompt status table above.

## Phase 1 foundation review

| #   | Item                                    | Status                                                   |
| --- | --------------------------------------- | -------------------------------------------------------- |
| 1   | Scaffold, strict TypeScript, Vite build | Pass (build re-verified in Prompts 7 to 9)               |
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

- Prompt 10 has not been run. Likely points of failure: the expected pixel values in the tests (for example the A5 and US Letter pixel sizes and the 1240 x 1754 A4 check depend on the rounding rule), the rulings test that checks evenly spaced rules within 0.02 px, and strict TypeScript on the spread-and-override fixtures.
- Pixel rounding: rule positions are rounded to two decimal places, while sheet and writable-area edges are rounded to whole pixels. A rule can therefore sit up to half a pixel from its theoretical position.
- The presets use one shared ruling style (8 mm, light grey). Real presets for handwriting may need different defaults.
- Presets are not yet linked to the persistence layer. A saved PaperTemplateRecord has no link to a preset id.
- The paper template ruling model has no option for a dotted or dashed line style. Only solid lines are supported.
- The margin ruling uses a fixed full-height vertical line. A margin that does not span the full sheet height is not yet supported.
- The database is at version 1 and has no real version 2 migration.
- The blocking handler closes the connection when another tab upgrades. A connection request still pending when close() runs can leak its connection.
- A blocked upgrade (another tab holding the database open) is not reported as an error and can wait indefinitely.
- transaction.done.catch in database.ts silences the transaction promise during upgrades.
- tests/setup.ts binds globalThis.Blob to Node's Blob for all test files.
- errors.ts identifies DOMExceptions by error.name, not instanceof, because of cross-realm errors under jsdom.
- The updatedAt index depends on canonical ISO strings. Records written by other code paths must use toISOString().
- The validators check record shape but not business rules, such as whether a sample asset id exists in the assets store.
- No cross-store consistency: deleting an asset does not update profiles that reference it.
- Status commits fe48a9f, 57457de and 6d281e3 updated PROJECT_STATE.md before verification was recorded in chat.
- E2E test runs in Chromium only.
- No automated tests for theme switching or responsive layout.
- Tests in tests/ are included in tsconfig, so a type error in a test fails npm run build.
- Header theme button is a placeholder (from Prompt 4).
- Generated shadcn files (dialog.tsx, select.tsx, sheet.tsx) import icons from 'lucide-react' directly.
- tailwind-merge 3.7.0 targets Tailwind v4 class names; project uses Tailwind 3.4.
- Tailwind scans all of src/, including .ts files. Strings such as 'table' and 'image' generate unused utility rules.
- Deep links on a static host need an SPA fallback on the production host.
- Vite base is './'. Decide base '/' or not when deploying to a domain root.
- Sidebar state and toasts are not persisted across reloads.
- node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI. Can be ignored.
- Prompts 2 to 9 were verified from written descriptions of browser output, not screenshots.
- Playwright's webServer rebuilds the app on every e2e run.

## Technical decisions and context

- Tailwind CSS v3.4, not v4, because the prompt requires tailwind.config.ts and a PostCSS config.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2). Do not run npx shadcn@latest.
- components.json was written by hand. Components are owned source files in src/components/ui.
- Icons are imported from src/lib/icons.ts only in app code.
- The engine folder remains protected from React imports. The paper geometry module contains no canvas or DOM calls.
- Paper units: the model uses millimetres. Pixels are derived at a DPI, using px = round(mm / 25.4 * dpi) for sheet and writable-area edges, and unrounded then rounded to two decimals for ruling positions.
- Preset ids (a4, a5, us-letter) are separate from persistence record ids. A saved paper template is a copy of a preset, not a reference to it.
- Ruling spacing: the first horizontal rule sits one pitch below the writable area's top edge. Rules stop at or before the bottom edge.
- Geometry functions validate their inputs and throw PaperGeometryError instead of returning NaN.
- The document type is named DocumentModel, not Document, to avoid shadowing the browser's Document type.
- Serialisation writes schemaVersion as a top-level field. parseDocument rejects a missing or different version.
- Ids come from an injectable IdFactory. The default uses crypto.getRandomValues.
- Persistence uses the idb wrapper with its untyped API. Each repository validates values on read and write.
- Record timestamps must be canonical ISO 8601 (toISOString output).
- Assets are stored as Blobs. The asset validator checks blobs by duck typing.
- Every repository failure goes through toStorageError.
- Migrations run in order inside the upgrade transaction.
- The only localStorage use is the theme preference.
- Theme persistence uses a plain localStorage string, so the pre-paint script in index.html can read it.
- vite.config.ts sets Vitest's test.include to tests/**/*.test.{ts,tsx}.
- jsdom has no matchMedia. tests/setup.ts provides a stub.
- Prompts 2 to 10 were verified from written descriptions, not screenshots.

## Exact next prompt number

- 10 (still open until Prompt 10 is verified; then move to 11)

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
