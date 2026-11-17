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
  - Test tooling (Prompt 7): vitest 3.2.7, jsdom 26.1, @testing-library/react 16.3.3, @testing-library/dom 10.4.2, @playwright/test 1.65.1
- Not yet installed: Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. Deferred to later phases.

## Current architecture and folder structure

```
calibre text to handwriting/   (project root)
  index.html               (inline pre-paint theme script in head)
  package.json, package-lock.json, tsconfig.json, vite.config.ts (includes Vitest config),
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
    engine/index.ts          (must not import React; enforced by ESLint rule)
    types/
      index.ts, ui.ts
    store/
      index.ts, uiStore.ts, themeStore.ts
    components/
      ui/                    (shadcn/ui owned source files: button, card, input, textarea, select, slider, dialog, dropdown-menu, tooltip, sheet)
      layout/                (AppShell, Header, SideNav, MobileDrawer)
      EmptyState.tsx
    features/
      home/, generator/, editor/, profiles/, paper/, pdf/, templates/, settings/
    lib/                     (utils.ts, icons.ts, navItems.ts)
    workers/                 (empty, reserved for Web Workers)
    assets/                  (empty)
  tests/
    setup.ts                 (matchMedia stub, Testing Library cleanup)
    smoke/routes.test.tsx    (one test per route, 9 cases)
    e2e/navigation.spec.ts   (home to editor, Chromium)
  dist/                      (build output, gitignored)
```

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

Routes: / (HomePage), /generator, /editor, /profiles, /paper-designer, /pdf-tools, /templates, /settings, and * (404). All are children of the App shell. Each section page has exactly one h1.

Layout: CSS grid, rows auto and minmax(0,1fr), so the header is fixed and the content row scrolls. Desktop (768px and up): 15rem sidebar plus main when sidebarOpen is true, main only when false. Below 768px: single column, navigation in the drawer.

Theme: mode is light, dark or system. The inline script in index.html sets the "dark" class before first paint. Stored under localStorage key calligraphewrite-theme.

## Last successfully completed prompt

- Prompt 7: Verification checkpoint 1, testing setup and foundation review (verified, commit 640d62b)

## Prompt status

| Prompt | Title                                                          | Status    | Reason                                                                                                                                                                                                 |
| ------ | -------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Project Setup and UI Foundation                                | Completed | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed.                                                                                                                |
| 2      | Install styling and UI kit                                     | Completed | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed. Committed as 8bc208f.                                                                             |
| 3      | Routing and global state scaffolding                           | Completed | react-router and zustand installed. Typecheck, lint, build passed. Browser checks passed. Committed as fcfdf57.                                                                                        |
| 4      | Application layout and responsive navigation                   | Completed | Typecheck, lint, build passed. Responsive, focus trap, Escape, route-change close checks passed. Committed as 2c236f5.                                                                                 |
| 5      | Theme management                                               | Completed | Typecheck, lint, build passed. Theme persistence, no-flash reload and OS-follow checks passed. Committed as 962ecb7.                                                                                   |
| 6      | Placeholder pages and empty states                             | Completed | Typecheck, lint, build passed. Browser checks passed. Committed as cc1056a.                                                                                                                            |
| 7      | Verification checkpoint 1: testing setup and foundation review | Completed | Developer pasted passing output: format:check, typecheck, lint, build (CSS 23.68 kB, JS 394.55 kB), npm test (9 of 9), npm run test:e2e (1 of 1, Chromium). Committed as 640d62b and pushed to master. |

Housekeeping after Prompt 6 (not a numbered prompt): completed, commit e0492ab.

## Features implemented

- Prompt 1: Default scaffold, strict TypeScript, ESLint with engine-isolation rule, Prettier.
- Prompt 2: Tailwind utility classes and CSS design tokens. Dark-mode token set. shadcn/ui components generated as owned files.
- Prompt 3: Client-side routing for eight sections plus a 404 page. Zustand UI store with sidebar state, active route and toast queue.
- Prompt 4: Grid-based app shell with header, side navigation (visible from 768px), left-side Sheet drawer below 768px with focus trap and Escape. Header theme button is a placeholder.
- Prompt 5: Light, dark and system theme modes, persisted to localStorage. Settings page with Appearance card.
- Prompt 6: Home page with two working links. Seven section pages each show an h1, a purpose line and a disabled CTA with a note. Settings keeps the working Appearance card.
- Prompt 7: Vitest with jsdom and Testing Library, nine smoke tests (one per route), Playwright e2e test for home to editor in Chromium, `test` and `test:e2e` scripts. `appRoutes` exported from router.tsx for memory-router tests.

## Files created

- Prompt 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files.
- Prompt 2 (commit 8bc208f): tailwind.config.ts, postcss.config.js, components.json, src/lib/utils.ts, src/lib/icons.ts, and 9 shadcn components in src/components/ui.
- Prompt 3 (commit fcfdf57): src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/app/router.tsx, src/app/NotFoundPage.tsx, src/components/PlaceholderPage.tsx.
- Prompt 4 (commit 2c236f5): src/components/ui/sheet.tsx, src/lib/navItems.ts, src/components/layout/AppShell.tsx, Header.tsx, SideNav.tsx, MobileDrawer.tsx.
- Prompt 5 (commit 962ecb7): src/store/themeStore.ts, src/features/settings/ThemeSelect.tsx, src/features/settings/SettingsPage.tsx.
- Prompt 6 (commit cc1056a): src/components/EmptyState.tsx, and seven feature pages under src/features.
- Prompt 7 (commit 640d62b): tests/setup.ts, tests/smoke/routes.test.tsx, tests/e2e/navigation.spec.ts, playwright.config.ts.

## Files modified

- Prompt 2: src/index.css, src/app/App.tsx, tsconfig.json, vite.config.ts, eslint.config.js, package.json, package-lock.json.
- Prompt 3: src/main.tsx, src/app/App.tsx, src/types/index.ts, src/lib/icons.ts, package.json, package-lock.json.
- Prompt 4: src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/index.css, src/app/App.tsx, src/lib/icons.ts.
- Prompt 5: index.html, src/index.css, src/app/router.tsx.
- Prompt 6: src/app/router.tsx, src/features/settings/SettingsPage.tsx.
- Housekeeping (commit e0492ab): PROJECT_STATE.md (reformatted, versions corrected).
- Prompt 7 (commit 640d62b): src/app/router.tsx (exports appRoutes), vite.config.ts (Vitest block), tsconfig.json (adds playwright.config.ts and tests), eslint.config.js (ignores and test-file rule), .gitignore, .prettierignore, package.json (scripts and devDependencies), package-lock.json (regenerated).

## Files deleted

- Prompt 6: src/components/PlaceholderPage.tsx.

## Latest results (as supplied by developer)

- Housekeeping (commit e0492ab): format:check PASS, typecheck PASS, lint PASS, build PASS (CSS 23.68 kB, JS 394.55 kB).
- Prompt 7 (commit 640d62b, developer-supplied output):
  - format:check: PASS
  - typecheck: PASS (0 errors)
  - lint: PASS (0 warnings or errors)
  - build: PASS (CSS 23.68 kB, JS 394.55 kB)
  - npm test: PASS, 9 of 9 tests (tests/smoke/routes.test.tsx)
  - npm run test:e2e: PASS, 1 of 1 test (tests/e2e/navigation.spec.ts, Chromium)
- Prompts 1 to 6: as recorded in the Prompt status table above.

## Phase 1 foundation review

| #   | Item                                    | Status                                                   |
| --- | --------------------------------------- | -------------------------------------------------------- |
| 1   | Scaffold, strict TypeScript, Vite build | Pass (build re-verified in Prompt 7)                     |
| 2   | ESLint engine-isolation, Prettier       | Pass (lint and format re-verified in Prompt 7)           |
| 3   | Tailwind 3.4, PostCSS, shadcn/ui        | Pass (build re-verified in Prompt 7)                     |
| 4   | Routing for 8 sections plus 404         | Pass (9 of 9 smoke tests)                                |
| 5   | Zustand UI and theme stores             | Pass (smoke tests load both stores)                      |
| 6   | Responsive app shell and navigation     | Pass (e2e navigation test, Chromium)                     |
| 7   | Light, dark and system theme            | Pass from Prompt 5 manual checks. No automated test yet. |
| 8   | Placeholder pages, one h1 each          | Pass (9 of 9 smoke tests)                                |
| 9   | Unit and smoke test tooling             | Pass (Prompt 7)                                          |
| 10  | E2E tooling (Playwright, Chromium)      | Pass (Prompt 7)                                          |

## Known bugs and unresolved issues

- E2E test runs in Chromium only. Firefox and WebKit are not configured.
- No automated tests for theme switching or responsive layout. Covered only by manual checks from Prompts 4 and 5.
- Tests in tests/ are included in tsconfig, so a type error in a test fails npm run build.
- Header theme button is a placeholder (from Prompt 4). Wire it to the theme store or remove it in a later prompt.
- Generated shadcn files (dialog.tsx, select.tsx, sheet.tsx) import icons from 'lucide-react' directly. Only in generated files.
- tailwind-merge 3.7.0 targets Tailwind v4 class names; project uses Tailwind 3.4. Possible mis-merging of a few classes. Check visually when styling work begins.
- Deep links on a static host need an SPA fallback on the production host. Not configured yet.
- Vite base is './'. Decide base '/' or not when deploying to a domain root.
- Sidebar state and toasts are not persisted across reloads. Only the theme is persisted.
- node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI. Can be ignored.
- Prompts 2 to 6 were verified from written descriptions of browser output, not screenshots.
- Tailwind scans all of src/. A plain English word such as "table" in a source comment generates a utility class. Keep comments free of class-like words where it matters for CSS size.
- Playwright's webServer rebuilds the app on every e2e run (npm run build, then vite preview). This adds a few seconds.

## Technical decisions and context

- Tailwind CSS v3.4, not v4, because the prompt requires tailwind.config.ts and a PostCSS config.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2). Do not run npx shadcn@latest.
- components.json was written by hand. Components are owned source files in src/components/ui.
- Icons are imported from src/lib/icons.ts only in app code.
- The engine folder remains protected from React imports.
- react-router v7 is imported from 'react-router', not 'react-router-dom'.
- Zustand selectors return a single value or a stable action each, never a new object.
- Theme persistence uses a plain localStorage string, so the pre-paint script in index.html can read it. Key and values must match between index.html and src/store/themeStore.ts.
- Test setup: Vitest is configured inside vite.config.ts with the jsdom environment. Unit and smoke tests live in tests/smoke. Playwright tests live in tests/e2e and are excluded from Vitest. Playwright runs against the production build via npm run build and vite preview on port 4173.
- jsdom has no matchMedia. tests/setup.ts provides a stub so the theme store and app shell load under test.
- The router's route list is exported as appRoutes. Tests mount it with createMemoryRouter. The browser router is built from the same list, so tests and the app use the same routes.
- Prompts 2 to 6 were verified from written descriptions, not screenshots. Ask for a screenshot if a later prompt depends on exact layout or colour.

## Exact next prompt number

- Next prompt to run: 8. Prompt 8 text has not yet been supplied in this chat. The developer must paste the Prompt 8 section from the v3 guide.

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
