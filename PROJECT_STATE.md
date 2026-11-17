# PROJECT_STATE.md

## Project overview
- Name: CalligrapheWrite
- Purpose: A local-first web app that converts pasted text into realistic handwritten pages, with paper, ink, pen, spacing and imperfection controls, a preloaded or personal handwriting profile, an editor, PDF and PNG export, and editing of existing handwritten PDFs.
- Constraints: No mandatory backend, authentication, MongoDB, Firebase, Cloudinary, paid APIs or cloud AI. Must run locally and deploy as a static site.

## Technology stack
- Planned: React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Zustand, HTML Canvas API, SVG, Konva.js, PDF.js, pdf-lib, KaTeX, IndexedDB, Web Workers, OpenCV.js.
- Installed so far: Vite, React 18, TypeScript (strict), ESLint (flat config with typescript-eslint and react-hooks/react-refresh plugins), Prettier.
- Not yet installed: Tailwind CSS, shadcn/ui, Lucide React, Zustand, Konva.js, PDF.js, pdf-lib, KaTeX, OpenCV.js. These are deferred to later phases.

## Current architecture and folder structure
```
calligraphewrite/
  index.html
  package.json, tsconfig.json, vite.config.ts, eslint.config.js, .prettierrc, .prettierignore, .gitignore, README.md
  src/
    main.tsx
    index.css
    vite-env.d.ts
    app/App.tsx
    engine/index.ts        (must not import React; enforced by ESLint rule)
    types/index.ts
    features/.gitkeep
    store/.gitkeep
    components/.gitkeep
    lib/.gitkeep
    workers/.gitkeep
    assets/.gitkeep
```

## Last successfully completed prompt
- Prompt 1: Project Setup and UI Foundation

## Prompt status
| Prompt | Title | Status | Reason |
| --- | --- | --- | --- |
| 1 | Project Setup and UI Foundation | Completed | Scaffold generated, dependencies installed, typecheck, lint, build, and dev server verified clean. |

## Features implemented
- Default scaffold page ("CalligrapheWrite" heading and status text) with strict TypeScript, ESLint rules (engine isolation enforced), and Vite dev server.

## Files created
- All files listed in the architecture section above, all NEW in Phase 1.

## Files modified
- None.

## Latest results (as supplied by developer)
- Build: PASS (tsc --noEmit && vite build completed with 0 errors)
- TypeScript (npm run typecheck): PASS (tsc --noEmit exited with code 0)
- Lint: PASS (eslint . exited with code 0)
- Dev server / console: PASS (http://localhost:5173 served HTTP 200 OK, JSX transformed cleanly, no console errors)

## Known bugs and unresolved issues
- None known. Phase 1 has not been run.

## Technical decisions and context
- Tailwind, shadcn/ui and other UI libraries are deferred so the first step stays small and verifiable. The UI foundation will be added in a later prompt.
- The Vite template was not run through create-vite. The equivalent files were written by hand to give full control over strict TypeScript settings.
- `tsc --noEmit` covers src and vite.config.ts through the root tsconfig.json, so it actually checks the code.
- The build script runs the type check before vite build.
- The engine folder is protected by an ESLint rule that forbids importing react and react-dom.
- base is './' in vite.config.ts so the static build works from any path.

## Exact next prompt number
- 2

## Instructions for continuing in another Claude account
1. Open a new chat and upload this PROJECT_STATE.md file, plus the current project files relevant to the next prompt.
2. Tell Claude: "Continue CalligrapheWrite from the next prompt number in PROJECT_STATE.md. Do not assume any file contents I have not provided."
3. Only mark a prompt Completed after the developer has pasted passing test and build output for it.
4. Keep PROJECT_STATE.md current after every prompt, and always provide the full updated file.
