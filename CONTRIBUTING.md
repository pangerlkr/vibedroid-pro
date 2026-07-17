# Contributing to Vibe Dev Companion

Thank you for your interest in contributing! This document outlines how to get involved.

## Getting Started

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/<your-username>/vibe-dev-companion.git`
3. **Install dependencies**: `npm install`
4. **Run the app**: `npm start`

## Development Setup

- Node.js >= 18.x
- Electron >= 43.x (installed via `devDependencies`)
- No build step required — Electron loads files directly

## How to Contribute

### Reporting Bugs

Open an [Issue](https://github.com/pangerlkr/vibe-dev-companion/issues) with:
- A clear title
- Steps to reproduce
- Expected vs actual behavior
- OS and Electron version

### Suggesting Features

Open an Issue tagged `enhancement` describing:
- The problem it solves
- Proposed implementation
- Any UX mockups or wireframes

### Submitting Pull Requests

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Write clean, commented code
3. Test locally with `npm start`
4. Commit with a conventional message: `feat: add X`, `fix: correct Y`, `chore: update Z`
5. Push and open a PR against `main`

## Code Style

- Use `camelCase` for variables and functions
- Prefer `const`/`let` over `var`
- Add comments explaining **why**, not just what
- Keep IPC handler names descriptive (e.g., `window:minimize`, `capture:toggle`)

## IPC Channel Conventions

All Electron IPC channels in `index.js` follow the pattern `namespace:action`:

| Channel | Direction | Description |
|---|---|---|
| `window:minimize` | renderer → main | Minimize window |
| `window:maximize` | renderer → main | Toggle maximize |
| `window:close` | renderer → main | Close window |
| `capture:toggle` | renderer → main | Toggle screen capture |
| `open:feed` | renderer → main | Open external AI feed |
| `history:get` | renderer → main | Get URL history |
| `history:add` | renderer → main | Add URL to history |
| `prefs:get` | renderer → main | Get persisted prefs |
| `prefs:set` | renderer → main | Save prefs to disk |

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
