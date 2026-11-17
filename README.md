# CalligrapheWrite

CalligrapheWrite is a local-first web app that converts pasted text into realistic handwritten pages. It runs entirely in the browser with no backend, accounts or paid APIs, and deploys as a static website.

## Requirements

- Node.js 20.19 or newer (or 22.12 or newer)
- npm 10 or newer

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check, then produce a static build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run `tsc --noEmit` on its own |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without changing files |

## Folder structure

```
src/
  app/        Application shell and top-level layout
  features/   Feature modules (paper, ink, editor, import/export, and so on)
  engine/     Pure TypeScript handwriting engine. Must not import React.
  store/      Zustand stores (added in a later phase)
  components/ Shared UI components
  lib/        Shared utilities
  workers/    Web Worker entry points
  types/      Shared domain types
  assets/     Static assets
```

## Deployment

Run `npm run build`. Upload the contents of `dist/` to any static host. The build uses relative asset paths, so it works from a domain root or a subfolder.
