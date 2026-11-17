# PROJECT_STATE.md

## Project overview

- Name: CalligrapheWrite
- Purpose: A local-first web app that converts pasted text into realistic handwritten pages, with paper, ink, pen, spacing and imperfection controls, a preloaded or personal handwriting profile, an editor, PDF and PNG export, and editing of existing handwritten PDFs.
- Constraints: No mandatory backend, authentication, MongoDB, Firebase, Cloudinary, paid APIs or cloud AI. Must run locally and deploy as a static site.
- Repository: GitHub, branch master.

## Technology stack

- Planned: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Zustand, HTML Canvas API, SVG, Konva.js, PDF.js, pdf-lib, KaTeX, IndexedDB, Web Workers, OpenCV.js.
- Installed and verified (Prompt 1): React 18.3.1, Vite 6, TypeScript 5.6 (strict), ESLint 9 (flat config with typescript-eslint, react-hooks and react-refresh), Prettier 3.
- Installed and verified (Prompt 2): Tailwind CSS 3.4 (v3 chosen because the prompt requires tailwind.config.ts and a PostCSS config), tailwindcss-animate, PostCSS, Autoprefixer, shadcn/ui components via the shadcn CLI 2.x line (shadcn@2.10.0 resolved), Radix UI primitives (installed by the CLI), class-variance-authority, clsx, tailwind-merge, lucide-react.
- Not yet installed: Zustand, Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. Deferred to later phases.

## Current architecture and folder structure

calligraphewrite/
index.html
package.json, package-lock.json, tsconfig.json, vite.config.ts, eslint.config.js,
tailwind.config.ts, postcss.config.js, components.json,
.prettierrc, .prettierignore, .gitignore, README.md
src/
main.tsx
index.css (Tailwind directives and shadcn design tokens)
vite-env.d.ts
app/App.tsx (temporary design-system check page)
engine/index.ts (must not import React; enforced by ESLint rule)
types/index.ts
lib/utils.ts (cn helper)
lib/icons.ts (single icon import point)
components/ui/ (shadcn/ui owned source files: button, card, input, textarea, select, slider, dialog, dropdown-menu, tooltip)
features/.gitkeep
store/.gitkeep
components/.gitkeep
workers/.gitkeep
assets/.gitkeep

Path alias: '@/' maps to src/ in both tsconfig.json paths and vite.config.ts.

## Last successfully completed prompt

- Prompt 2: Install styling and UI kit (verified, commit 8bc208f)

## Prompt status

| Prompt | Title                           | Status    | Reason                                                                                                                                                                                                                                         |
| ------ | ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Project Setup and UI Foundation | Completed | Scaffold committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed. Developer reports no console errors.                                                                                                                   |
| 2      | Install styling and UI kit      | Completed | Tailwind 3.4 and PostCSS set up. 9 shadcn/ui components generated. Typecheck, lint and build passed (CSS 19.08 kB, JS 184.75 kB). Dev server visual check passed (bordered card, dark button, empty console). Committed as 8bc208f and pushed. |

## Features implemented

- Prompt 1: Default scaffold page, strict TypeScript, ESLint with engine-isolation rule, Prettier with format and format:check scripts.
- Prompt 2: Tailwind utility classes and CSS design tokens (background, foreground, muted, accent, border, plus card, popover, primary, secondary, destructive, input, ring and radius). Dark-mode token set defined under the .dark class (no toggle yet). shadcn/ui components generated as owned files. Temporary design-system check page in App.tsx (bordered Card with Sparkles icon and a primary Button).

## Files created

- Prompt 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files in src/features, src/store, src/components, src/lib, src/workers, src/assets.
- Prompt 2 (commit 8bc208f): tailwind.config.ts, postcss.config.js, components.json, src/lib/utils.ts, src/lib/icons.ts, src/components/ui/button.tsx, card.tsx, input.tsx, textarea.tsx, select.tsx, slider.tsx, dialog.tsx, dropdown-menu.tsx, tooltip.tsx.

## Files modified

- Prompt 2: src/index.css (replaced with Tailwind directives and tokens), src/app/App.tsx (replaced with design check page), tsconfig.json (added paths alias), vite.config.ts (added '@' alias), eslint.config.js (added shadcn override for src/components/ui), package.json and package-lock.json (dependencies added by npm installs).

## Latest results (as supplied by developer)

- Prompt 1 typecheck: PASS. Lint: PASS. Build: PASS. Dev server: PASS (HTTP 200, no console errors reported).
- Prompt 2 shadcn CLI (npx shadcn@2 add ... -y): PASS (9 files created in src/components/ui, one deprecation warning from a transitive dependency, node-domexception, which is harmless).
- Prompt 2 typecheck: PASS (tsc --noEmit, exit code 0).
- Prompt 2 lint: PASS (eslint ., exit code 0, 0 warnings or errors).
- Prompt 2 build: PASS (tsc --noEmit && vite build, 2139 modules, CSS 19.08 kB, JS 184.75 kB).
- Prompt 2 dev server: PASS (card bordered and centred, Sparkles icon beside title, primary button dark with light text, browser console empty).

## Known bugs and unresolved issues

- None known in verified code.
- The developer's machine is Windows (CLI output shows backslash paths). Path handling is untested on macOS or Linux, but nothing in the code is OS-specific.
- The node-domexception deprecation warning comes from a transitive dependency of the shadcn CLI, not from app code. It can be ignored.

## Technical decisions and context

- Tailwind CSS v3.4 is used, not v4, because the prompt requires tailwind.config.ts and a PostCSS config. Tailwind v4 is CSS-first and would need a different setup.
- The shadcn CLI is pinned to the 2.x line (npx shadcn@2) because it supports Tailwind v3. Do not run npx shadcn@latest in this project, since newer versions generate Tailwind v4 style files. Components are owned source files in src/components/ui.
- components.json was written by hand, so the CLI's init step is skipped.
- The react-refresh rule is turned off only for src/components/ui, because shadcn components export variants alongside components.
- Icons are imported from src/lib/icons.ts only. Add new icons to that file. Do not import from lucide-react directly in app code.
- Tailwind and shadcn tokens use HSL channel values (for example "222.2 84% 4.9%") consumed as hsl(var(--token)).
- The engine folder remains protected from React imports.
- tailwind.config.ts is not in tsconfig include, so type checking does not cover it. ESLint still lints it.
- Prompt 2 was verified from a visual description rather than a screenshot. If a later prompt depends on exact styling, ask for a screenshot.

## Exact next prompt number

- 3

## Instructions for continuing in another Claude account

1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
5. The GitHub repository on branch master holds the latest committed code. Pull it before working in a new environment.
