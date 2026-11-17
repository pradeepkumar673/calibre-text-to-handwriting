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
- Installed and verified (Prompt 3): react-router 7.13.0 (imported from 'react-router'), zustand 5.0.3.
- Installed and verified (Prompt 4): shadcn Sheet component (src/components/ui/sheet.tsx, via the CLI). It reuses the Radix Dialog package already installed.
- Installed and verified (Prompt 5): no new packages. Uses existing Zustand and shadcn Select.
- Installed and verified (Prompt 6): no new packages.
- Not yet installed: Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. Deferred to later phases.

## Current architecture and folder structure

calligraphewrite/
index.html (inline pre-paint theme script in head)
package.json, package-lock.json, tsconfig.json, vite.config.ts, eslint.config.js,
tailwind.config.ts, postcss.config.js, components.json,
.prettierrc, .prettierignore, .gitignore, README.md
src/
main.tsx (renders RouterProvider with the router)
index.css (Tailwind directives, shadcn tokens, color-scheme per theme, reduced-motion rule)
vite-env.d.ts
app/
App.tsx (renders AppShell)
router.tsx (createBrowserRouter: 8 sections + 404, children of App)
NotFoundPage.tsx
engine/index.ts (must not import React; enforced by ESLint rule)
types/
index.ts (re-exports type modules)
ui.ts (UI slice state, actions, Toast types)
store/
index.ts (typed UI store hooks, one per value or action)
uiStore.ts (Zustand UI slice)
themeStore.ts (Zustand theme slice, persisted to localStorage key calligraphewrite-theme)
components/
ui/ (shadcn/ui owned source files: button, card, input, textarea, select, slider, dialog, dropdown-menu, tooltip, sheet)
layout/
AppShell.tsx (CSS grid shell, route sync, drawer close on route change, toast viewport)
Header.tsx (app name, drawer button for mobile, sidebar toggle for desktop, theme placeholder button)
SideNav.tsx (NavLink list, used in sidebar and drawer)
MobileDrawer.tsx (Sheet from the left below 768px)
EmptyState.tsx (shared empty-state panel built on shadcn Card)
.gitkeep
features/
home/HomePage.tsx (intro and Open Generator / Handwriting Profiles links)
generator/GeneratorPage.tsx (empty state, CTA disabled)
editor/EditorPage.tsx (empty state, CTA disabled)
profiles/ProfilesPage.tsx (empty state, CTA disabled)
paper/PaperDesignerPage.tsx (empty state, CTA disabled)
pdf/PdfToolsPage.tsx (empty state, CTA disabled)
templates/TemplatesPage.tsx (empty state, CTA disabled)
settings/
SettingsPage.tsx (Appearance card plus empty-state panel for future settings)
ThemeSelect.tsx (Light, Dark, System select bound to themeStore)
lib/
utils.ts (cn helper)
icons.ts (single icon import point)
navItems.ts (ordered NAV_ITEMS list)
.gitkeep
workers/.gitkeep
assets/.gitkeep

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

Routes: / (HomePage), /generator, /editor, /profiles, /paper-designer, /pdf-tools, /templates, /settings, and * (404). All are children of the App shell. Each section page has exactly one h1 and no PlaceholderPage is used.

Layout: CSS grid, rows auto and minmax(0,1fr), so the header is fixed and the content row scrolls. Desktop (768px and up): 15rem sidebar plus main when sidebarOpen is true, main only when false. Below 768px: single column, navigation in the drawer.

Theme: mode is light, dark or system. The inline script in index.html sets the "dark" class before first paint. themeStore applies the class on load and on every change, and follows OS changes in system mode. Stored under localStorage key calligraphewrite-theme (values light, dark, system; missing or invalid means system).

## Last successfully completed prompt

- Prompt 6: Placeholder pages and empty states (verified)

## Prompt status

| Prompt | Title                                        | Status    | Reason                                                                                                                                                                                                                                                                                                            |
| ------ | -------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Project Setup and UI Foundation              | Completed | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed. Developer reports no console errors.                                                                                                                                                                                      |
| 2      | Install styling and UI kit                   | Completed | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed (CSS 19.08 kB, JS 184.75 kB). Dev server visual check passed. Committed as 8bc208f and pushed.                                                                                                                |
| 3      | Routing and global state scaffolding         | Completed | react-router 7.13.0 and zustand 5.0.3 installed with 0 vulnerabilities and 0 peer warnings. Typecheck, lint and build (CSS 19.84 kB, JS 286.47 kB) passed. All 8 routes, the 404 page, back/forward, sidebar toggle and toast queue checked in the browser with a clean console. Committed as fcfdf57 and pushed. |
| 4      | Application layout and responsive navigation | Completed | shadcn Sheet added. AppShell (CSS grid), Header, SideNav and MobileDrawer created. Typecheck, lint and build (CSS 22.67 kB, JS 327.56 kB) passed. Responsive, focus trap, Escape, route-change close, resize close and no-horizontal-overflow checks passed. Committed as 2c236f5 and pushed.                     |
| 5      | Theme management                             | Completed | Inline pre-paint script, themeStore, ThemeSelect, SettingsPage, router update and color-scheme CSS. Typecheck, lint, build (CSS 23.50 kB, JS 390.14 kB) passed. Theme persistence, no-flash reload and OS-follow checks passed. Committed as 962ecb7 and pushed.                                                  |
| 6      | Placeholder pages and empty states           | Completed | Shared EmptyState, eight feature pages with one h1 each, Home entry links, Settings empty-state panel, router updated, and PlaceholderPage deleted. Typecheck, lint, build (CSS 23.68 kB, JS 394.55 kB) and browser checks passed.                                                                                |

## Features implemented

- Prompt 1: Default scaffold page, strict TypeScript, ESLint with engine-isolation rule, Prettier with format and format:check scripts.
- Prompt 2: Tailwind utility classes and CSS design tokens (background, foreground, muted, accent, border, plus card, popover, primary, secondary, destructive, input, ring and radius). Dark-mode token set defined under the .dark class. shadcn/ui components generated as owned files.
- Prompt 3: Client-side routing for eight sections plus a 404 page, inside the app shell. Zustand UI store with sidebar state, active route and toast queue, exposed through typed hooks. Toasts do not auto-dismiss.
- Prompt 4: Grid-based app shell with a header, side navigation (eight sections in order, visible from 768px), a left-side Sheet drawer below 768px with focus trapping and Escape to close, route-change close, resize close, visible focus rings, and reduced-motion support. The toast viewport lives in the shell. The header theme button is a placeholder.
- Prompt 5: Light, dark and system theme modes. Choice saved to localStorage under calligraphewrite-theme. Theme applied before first paint by an inline script. System mode follows OS changes. Settings page with an Appearance card and a Theme select. Dark-mode CSS variables and color-scheme set per theme.
- Prompt 6: Home page with an introduction and two working links (Generator, Handwriting Profiles). Seven section pages each show an h1, a one-line purpose and a shared EmptyState card. Their call-to-action buttons are disabled and labelled as arriving in later phases. Settings keeps the working Appearance card and adds an empty-state panel.

## Files created

- Prompt 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files.
- Prompt 2 (commit 8bc208f): tailwind.config.ts, postcss.config.js, components.json, src/lib/utils.ts, src/lib/icons.ts, src/components/ui/button.tsx, card.tsx, input.tsx, textarea.tsx, select.tsx, slider.tsx, dialog.tsx, dropdown-menu.tsx, tooltip.tsx.
- Prompt 3 (commit fcfdf57): src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/app/router.tsx, src/app/NotFoundPage.tsx, src/components/PlaceholderPage.tsx.
- Prompt 4 (commit 2c236f5): src/components/ui/sheet.tsx (CLI-generated), src/lib/navItems.ts, src/components/layout/AppShell.tsx, Header.tsx, SideNav.tsx, MobileDrawer.tsx.
- Prompt 5 (commit 962ecb7): src/store/themeStore.ts, src/features/settings/ThemeSelect.tsx, src/features/settings/SettingsPage.tsx.
- Prompt 6: src/components/EmptyState.tsx, src/features/home/HomePage.tsx, src/features/generator/GeneratorPage.tsx, src/features/editor/EditorPage.tsx, src/features/profiles/ProfilesPage.tsx, src/features/paper/PaperDesignerPage.tsx, src/features/pdf/PdfToolsPage.tsx, src/features/templates/TemplatesPage.tsx.

## Files modified

- Prompt 2: src/index.css, src/app/App.tsx, tsconfig.json, vite.config.ts, eslint.config.js, package.json, package-lock.json.
- Prompt 3: src/main.tsx (renders RouterProvider), src/app/App.tsx (app shell), src/types/index.ts (re-exports ui types), src/lib/icons.ts, package.json and package-lock.json.
- Prompt 4: src/types/ui.ts, src/store/uiStore.ts, src/store/index.ts, src/index.css (reduced-motion rule), src/app/App.tsx (now renders AppShell), src/lib/icons.ts (added Moon). Removed from the header: the "Route:" debug text and the "Send test toast" button. Nav labels renamed to "Handwriting Profiles", "Paper Designer" and "PDF Tools".
- Prompt 5: index.html (inline pre-paint theme script, added to head), src/index.css (color-scheme declarations on :root and .dark), src/app/router.tsx (settings route now renders SettingsPage).
- Prompt 6: src/app/router.tsx (every route now renders its feature page, not PlaceholderPage), src/features/settings/SettingsPage.tsx (adds h1, purpose line and empty-state panel).

## Files deleted

- Prompt 6: src/components/PlaceholderPage.tsx (no longer used).

## Latest results (as supplied by developer)

- Prompt 1 typecheck: PASS. Lint: PASS. Build: PASS. Dev server: PASS.
- Prompt 2 shadcn CLI: PASS (9 files created). Typecheck: PASS. Lint: PASS. Build: PASS (CSS 19.08 kB, JS 184.75 kB). Dev server visual check: PASS.
- Prompt 3 install: PASS (react-router 7.13.0, zustand 5.0.3, 0 vulnerabilities, 0 peer warnings). Typecheck: PASS. Lint: PASS. Build: PASS (CSS 19.84 kB, JS 286.47 kB). Browser checks: PASS.
- Prompt 4 shadcn CLI: PASS (sheet.tsx created). Typecheck: PASS. Lint: PASS. Build: PASS (CSS 22.67 kB, JS 327.56 kB). Browser checks: PASS.
- Prompt 5 typecheck: PASS. Lint: PASS. Build: PASS (CSS 23.50 kB, JS 390.14 kB). Browser checks: PASS.
- Prompt 6 typecheck: PASS (tsc --noEmit, exit code 0).
- Prompt 6 lint: PASS (eslint ., exit code 0).
- Prompt 6 build: PASS (tsc --noEmit && vite build, CSS 23.68 kB, JS 394.55 kB, exit code 0).
- Prompt 6 browser checks: PASS (exactly one h1 per page, home links navigate correctly, CTA buttons disabled with note, dark and light theme legibility clean, 0 console errors or warnings).

## Known bugs and unresolved issues

- None known in verified code.
- Call-to-action buttons on the placeholder pages are disabled until their features are built. Each is intentional.
- The header theme button (moon icon) is still a placeholder. The real control is on the Settings page. Wire the header button to the theme store, or remove it, in a later prompt.
- Generated shadcn files (dialog.tsx, select.tsx, sheet.tsx) import icons from 'lucide-react' directly. This breaks the icons-only-through-lib/icons rule, but only in generated files. App code follows the rule.
- Deep links on a static host: refreshing a nested route such as /generator works under the Vite dev server but needs an SPA fallback (a rewrite to index.html) on the production host. Not configured yet. Address at deployment.
- The Vite base is './' (relative). Deeper routes may need base '/' when deploying to a domain root. Decide at deployment time.
- Sidebar state and toasts are not persisted across reloads. Only the theme is persisted.
- If localStorage is blocked, the theme still works for the session but is not saved.
- The developer's machine is Windows. Path handling is untested on macOS or Linux, but nothing in the code is OS-specific.
- The node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI, not from app code. It can be ignored.

## Technical decisions and context

- Tailwind CSS v3.4 is used, not v4, because the prompt requires tailwind.config.ts and a PostCSS config.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2). Do not run npx shadcn@latest in this project, since newer versions generate Tailwind v4 style files. Components are owned source files in src/components/ui.
- components.json was written by hand, so the CLI's init step is skipped.
- The react-refresh rule is turned off only for src/components/ui.
- Icons are imported from src/lib/icons.ts only in app code. Add new icons to that file.
- Tailwind and shadcn tokens use HSL channel values consumed as hsl(var(--token)).
- The engine folder remains protected from React imports.
- tailwind.config.ts is not in tsconfig include, so type checking does not cover it. ESLint still lints it.
- react-router v7 is imported from the 'react-router' package, not 'react-router-dom'. Use createBrowserRouter and RouterProvider from 'react-router'.
- Zustand selectors return a single value or a stable action function each, never a new object. This avoids re-render loops in Zustand v5.
- Theme persistence uses a plain string in localStorage, not Zustand's persist middleware, so the pre-paint inline script in index.html can read it without loading JavaScript. The key and values must match between index.html and src/store/themeStore.ts.
- The theme store applies the dark class at module load. Module load happens when the router imports the Settings page, which is before first render.
- Breakpoint: 768px (Tailwind md) separates desktop sidebar from mobile drawer. AppShell uses the same breakpoint in its matchMedia query.
- Drawer open state is mobileNavOpen in uiStore. sidebarOpen only controls the desktop sidebar.
- Each feature page is a self-contained component under src/features. Business logic arrives in later phases, not here.
- Prompts 2 to 6 were verified from written descriptions of the browser output rather than screenshots. If a later prompt depends on exact layout or colour, ask for a screenshot.

## Exact next prompt number

- 7

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
