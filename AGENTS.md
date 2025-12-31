# Repository Guidelines

This document explains how to contribute to **morkborg_dungeoncrawl**. Keep it short, follow the commands below, and keep your changes focused on a single feature or fix.

## Project Structure & Module Organization
- **src/** – All source code lives here.
  - `components/` – Reusable React components (e.g., `DungeonView.tsx`).
  - `contexts/` – Context providers for global state (`CharacterContext.tsx`, `DungeonContext.tsx`).
  - `data/` – Static game data such as weapons and armor.
  - `utils/` – Small helper functions (e.g., random number generators).
  - `assets/tiles/` – PNG tiles used to render the dungeon map.
- **public/** – Static files served by Vite.
- **dist/** – Production build output (generated automatically). Do **not** commit anything here.

### Naming conventions
- Component files: PascalCase (`DungeonView.tsx`).
- Context files: PascalCase with `Context` suffix (`CharacterContext.tsx`).
- Data modules: snake_case (`weapons.ts`, `potions.ts`).
- Utility functions: camelCase, exported from `utils/`.

## Build, Test, and Development Commands
```bash
# Start the Vite dev server (hot‑reload, local preview)
npm run dev

# Compile TypeScript & build assets for production
npm run build

# Preview the built app locally after `build`
npm run preview
```

> **Tip**: After making changes, run `npm run dev` and navigate to http://localhost:5173/.

## Adding Features
1. Create a new component or context in the appropriate folder.
2. Import it in `src/index.tsx` if you want it rendered immediately.
3. Update any relevant data files under `src/data/`.
4. Run `npm run lint` to ensure style compliance.

## Security & Configuration Tips
- Keep all secrets (API keys, tokens) out of the repo. Use environment variables and reference them via Vite's `$env` prefixed names.
- Avoid committing binary files larger than 1 MiB to keep history lightweight.

---

Happy hacking! If you have questions, open an issue or start a discussion in the repository.

