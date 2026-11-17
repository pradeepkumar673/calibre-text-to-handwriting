# PROJECT_STATE.md

## Project overview

- Name: CalligrapheWrite
- Purpose: A local-first web app that converts pasted text into realistic handwritten pages, with paper, ink, pen, spacing and imperfection controls, a preloaded or personal handwriting profile, an editor, PDF and PNG export, and editing of existing handwritten PDFs.
- Constraints: No mandatory backend, authentication, MongoDB, Firebase, Cloudinary, paid APIs or cloud AI. Must run locally and deploy as a static site.
- Repository: GitHub, branch master.

## Technology stack

- Planned: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Zustand, HTML Canvas API, SVG, Konva.js, PDF.js, pdf-lib, KaTeX, IndexedDB, Web Workers, OpenCV.js.
- Installed and verified (Prompt 1): React 18.3.1, Vite 6, TypeScript 5.6 (strict), ESLint 9 (flat config with typescript-eslint, react-hooks and react-refresh), Prettier 3.
- Installed and verified (Prompt 2): Tailwind CSS 3.4, tailwindcss-animate, PostCSS, Autoprefixer, shadcn/ui components via the shadcn CLI 2.x line (shadcn@2.10.0 resolved), Radix UI primitives (installed by the CLI), class-variance-authority, clsx, tailwind-merge, lucide-react.
- Installed and verified (Prompt 3): react-router v7 (imported from 'react-router'), zustand v5.
- Not yet installed: Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. Deferred to later phases.

## Current architecture and folder structure

calligraphewrite/
index.html
package.json, package-lock.json, tsconfig.json, vite.config.ts, eslint.config.js,
tailwind.config.ts, postcss.config.js, components.json,
.prettierrc, .prettierignore, .gitignore, README.md
src/
main.tsx (renders RouterProvider with the router)
index.css (Tailwind directives and shadcn design tokens)
vite-env.d.ts
app/
App.tsx (app shell: sidebar, header, toast viewport, Outlet)
router.tsx (createBrowserRouter: 8 sections + 404)
NotFoundPage.tsx
engine/index.ts (must not import React; enforced by ESLint rule)
types/
index.ts (re-exports type modules)
ui.ts (UI slice state, actions, Toast types)
store/
index.ts (typed hooks, one per value or action)
uiStore.ts (Zustand UI slice)
components/
ui/ (shadcn/ui owned source files: button, card, input, textarea, select, slider, dialog, dropdown-menu, tooltip)
PlaceholderPage.tsx (shared placeholder for unbuilt sections)
.gitkeep
lib/
utils.ts (cn helper)
icons.ts (single icon import point)
.gitkeep
features/.gitkeep
workers/.gitkeep
assets/.gitkeep

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

Routes: / (Home), /generator, /editor, /profiles, /paper-designer, /pdf-tools, /templates, /settings, and * (404). All are children of the App shell.

## Last successfully completed prompt

- Prompt 3: Routing and global state scaffolding (verified)

## Prompt status

| Prompt | Title                                | Status    | Reason                                                                                                                                                                                              |
| ------ | ------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Project Setup and UI Foundation      | Completed | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed. Developer reports no console errors.                                                                        |
| 2      | Install styling and UI kit           | Completed | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed (CSS 19.08 kB, JS 184.75 kB). Dev server visual check passed. Committed as 8bc208f and pushed.  |
| 3      | Routing and global state scaffolding | Completed | react-router v7 and zustand v5 installed. App shell, typed UI store hooks, 8 section routes and 404 page created. Typecheck, lint, build (CSS 19.84 kB, JS 286.47 kB) and dev server checks passed. |

## Features implemented

- Prompt 1: Default scaffold page, strict TypeScript, ESLint with engine-isolation rule, Prettier with format and format:check scripts.
- Prompt 2: Tailwind utility classes and CSS design tokens (background, foreground, muted, accent, border, plus card, popover, primary, secondary, destructive, input, ring and radius). Dark-mode token set defined under the .dark class (no toggle yet). shadcn/ui components generated as owned files.
- Prompt 3: Client-side routing for eight sections plus a 404 page, all inside an app shell with a collapsible sidebar using NavLink, a header showing the current route, and a toast viewport. Zustand UI store with sidebar state, active route, and toast queue, exposed through typed hooks. The Prompt 2 design-check card has been removed from the shell.

## Files created

- Prompt 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files.
- Prompt 2 (commit 8bc208f): tailwind.config.ts, postcss.config.js, components.json, src/lib/utils.ts, src/lib/icons.ts, src/components/ui/button.tsx, card.tsx, input.tsx, textarea.tsx, select.tsx, slider.tsx, dialog.tsx, dropdown-menu.tsx, tooltip.tsx.
- Prompt 3: src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/app/router.tsx, src/app/NotFoundPage.tsx, src/components/PlaceholderPage.tsx.

## Files modified

- Prompt 2: src/index.css, src/app/App.tsx, tsconfig.json, vite.config.ts, eslint.config.js, package.json, package-lock.json.
- Prompt 3: src/main.tsx (now renders RouterProvider), src/app/App.tsx (now the app shell; Prompt 2 design-check content removed), src/types/index.ts (re-exports ui types), src/lib/icons.ts (added Home, Menu, X, FileText, LayoutTemplate, Ruler, Settings, Users and the LucideIcon type), package.json and package-lock.json (react-router and zustand added).

## Latest results (as supplied by developer)

- Prompt 1 typecheck: PASS. Lint: PASS. Build: PASS. Dev server: PASS.
- Prompt 2 shadcn CLI: PASS (9 files created). Typecheck: PASS. Lint: PASS. Build: PASS (CSS 19.08 kB, JS 184.75 kB). Dev server visual check: PASS.
- Prompt 3 install: PASS (react-router 7.13.0, zustand 5.0.3, 0 vulnerabilities).
- Prompt 3 typecheck: PASS (tsc --noEmit, exit code 0).
- Prompt 3 lint: PASS (eslint ., exit code 0).
- Prompt 3 build: PASS (tsc --noEmit && vite build, CSS 19.84 kB, JS 286.47 kB, exit code 0).
- Prompt 3 dev server: PASS (all 8 routes load corresponding PlaceholderPage, /does-not-exist loads 404 page, sidebar toggle works, toast push/dismiss works, console clean).

## Known bugs and unresolved issues

- None known in verified code.
- Deep links on a static host: refreshing a nested route such as /generator works under the Vite dev server but needs an SPA fallback (a rewrite to index.html) on the production host. This is not configured yet.
- The Vite base is './' (relative). This works for single-level routes like the current ones. Deeper nested routes in a later phase may need base '/' when deploying to a domain root. Decide at deployment time.
- The developer's machine is Windows. Path handling is untested on macOS or Linux, but nothing in the code is OS-specific.
- The node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI, not from app code. It can be ignored.

## Technical decisions and context

- Tailwind CSS v3.4 is used, not v4, because the prompt requires tailwind.config.ts and a PostCSS config.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2). Do not run npx shadcn@latest in this project, since newer versions generate Tailwind v4 style files. Components are owned source files in src/components/ui.
- components.json was written by hand, so the CLI's init step is skipped.
- The react-refresh rule is turned off only for src/components/ui.
- Icons are imported from src/lib/icons.ts only. Add new icons to that file. Do not import from lucide-react directly in app code.
- Tailwind and shadcn tokens use HSL channel values consumed as hsl(var(--token)).
- The engine folder remains protected from React imports.
- tailwind.config.ts is not in tsconfig include, so type checking does not cover it. ESLint still lints it.
- react-router v7 is imported from the 'react-router' package, not 'react-router-dom'. Use createBrowserRouter and RouterProvider from 'react-router'.
- Zustand selectors return a single value or a stable action function each, never a new object. This avoids re-render loops in Zustand v5.
- Each route currently renders a PlaceholderPage. Each later phase replaces its placeholder with a real feature component under src/features.

## Exact next prompt number

- 4

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
