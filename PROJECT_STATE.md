# PROJECT_STATE.md

## Project overview
- Name: CalligrapheWrite
- Purpose: A local-first web app that converts pasted text into realistic handwritten pages, with paper, ink, pen, spacing and imperfection controls, a preloaded or personal handwriting profile, an editor, PDF and PNG export, and editing of existing handwritten PDFs.
- Constraints: No mandatory backend, authentication, MongoDB, Firebase, Cloudinary, paid APIs or cloud AI. Must run locally and deploy as a static site.

## Technology stack
- Planned: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Zustand, HTML Canvas API, SVG, Konva.js, PDF.js, pdf-lib, KaTeX, IndexedDB, Web Workers, OpenCV.js.
- Installed so far: React 18.3.1, Vite 6, TypeScript 5.6 (strict), ESLint 9 (flat config with typescript-eslint, react-hooks and react-refresh plugins), Prettier 3.
- Not yet installed: Tailwind CSS, shadcn/ui, Lucide React, Zustand, Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. These are deferred to later phases.

## Current architecture and folder structure

calligraphewrite/
index.html
package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, README.md
src/
main.tsx
index.css
vite-env.d.ts
app/App.tsx
engine/index.ts (must not import React; enforced by ESLint rule)
types/index.ts
features/.gitkeep
store/.gitkeep
components/.gitkeep
lib/.gitkeep
workers/.gitkeep
assets/.gitkeep


## Last successfully completed prompt
- Prompt 1: Project Setup and UI Foundation (verified, commit 35bbe5b)

## Prompt status
| Prompt | Title | Status | Reason |
| --- | --- | --- | --- |
| 1 | Project Setup and UI Foundation | Completed | Scaffold generated and committed as 35bbe5b. Typecheck, lint, build and dev server (HTTP 200) passed. Developer reports no console errors. |

## Features implemented
- Default scaffold page ("CalligrapheWrite" heading and status text) served by the Vite dev server.
- Strict TypeScript configuration.
- ESLint with an engine-isolation rule that forbids importing react and react-dom from src/engine.
- Prettier configuration with format and format:check scripts.

## Files created
- Phase 1 (commit 35bbe5b): package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, index.html, README.md, src/main.tsx, src/index.css, src/vite-env.d.ts, src/app/App.tsx, src/engine/index.ts, src/types/index.ts, and .gitkeep files in src/features, src/store, src/components, src/lib, src/workers, src/assets.

## Files modified
- None.

## Latest results (as supplied by developer)
- Typecheck (npm run typecheck): PASS (tsc --noEmit, exit code 0, 0 errors)
- Lint (npm run lint): PASS (eslint ., exit code 0, 0 warnings or errors)
- Build (npm run build): PASS (tsc --noEmit && vite build, 27 modules, exit code 0)
- Dev server (http://localhost:5173): PASS (HTTP 200, heading and subtext render, developer reports no console errors)
- Git: committed as 35bbe5b "Phase 1: project setup and UI shell"

## Known bugs and unresolved issues
- None known.
- The dev-server check was an HTTP and module-transform check plus a developer-reported console check. Re-confirm the browser console is empty if any later issue appears.

## Technical decisions and context
- Tailwind, shadcn/ui and other UI libraries are deferred so the first step stays small and verifiable. The UI foundation will be added in a later prompt.
- The Vite template was not run through create-vite. The equivalent files were written by hand to give full control over strict TypeScript settings.
- tsc --noEmit covers src and vite.config.ts through the root tsconfig.json.
- The build script runs the type check before vite build.
- The engine folder is protected by an ESLint rule that forbids importing react and react-dom.
- base is './' in vite.config.ts so the static build works from any path.
- Node 20.19+ or 22.12+ is required.

## Exact next prompt number
- 2

## Instructions for continuing in another Claude account
1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
