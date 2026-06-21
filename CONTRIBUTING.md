# Contributing to VibeMusic

## Quick Start

```bash
npm install
npm run tauri dev  # Full desktop dev
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server (web only, port 1420) |
| `npm run tauri dev` | Desktop app with hot-reload |
| `npm run build` | Typecheck + bundle (`tsc && vite build`) |
| `npm run lint` | ESLint + Stylelint |
| `npm run lint:fix` | Auto-fix linters |
| `npm run test:run` | Run all tests (vitest) |

## Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add crossfade support
fix: prevent crash on empty queue
chore: bump deps
```

Pre-commit hooks (Husky + lint-staged) auto-lint staged files.

## Project Structure

```
src/             React frontend (TypeScript)
src-tauri/src/   Rust backend
src/stores/      Zustand state stores
src/components/  UI components (shadcn/ui in components/ui/)
src/pages/       Page-level components
src/lib/         Utilities and API layer
src-tauri/migrations/  SQLite schema migrations
```

## Rust Notes

- Lib crate is named `vibemusic_lib` (avoids Windows cargo name collision)
- Run `cargo check` before committing Rust changes
- Tauri commands are registered in a single `generate_handler![]` block in `lib.rs`

## License

GPL-3.0-only
