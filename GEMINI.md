# Gemini CLI Instructions

This file provides guidance to Gemini CLI when working with code in this repository.

## Additional Context

Before proceeding with any task, read the following files to ground yourself in project conventions:
- `.ai/context/tech-stack.md` — Coding standards and tech stack details
- `.ai/context/product.md` — Product vision, personas, and core user flows

## Project Overview

**Force Navigator Redux** is a Chrome Extension (Manifest V3) that acts as a command palette for Salesforce. It injects a keyboard-driven search UI into Salesforce pages, allowing navigation to Setup pages, record creation, and admin tasks without clicking through menus.

## Commands

```bash
# Development build with watch mode
npm run watch

# Production build (minified, output to /build)
npm run build

# Format code with Prettier
npm run format
```

There is no test suite. To test, load the unpacked extension from the `/build` directory in Chrome (`chrome://extensions` → Load unpacked).

## Release Process

1. Update version in both `package.json` and `public/manifest.json` (keep in sync)
2. Run `npm run build`
3. Zip the `build/` directory for Chrome Web Store submission

## Architecture

### Entry Points (Webpack bundles from `src/`)

- **`contentScript.js`** — Core logic injected into all Salesforce pages (`*.force.com`, `*.salesforce.com`, etc.). Builds the command palette DOM, handles user input, and queries Salesforce APIs. This is where most feature development happens.
- **`serviceWorker.js`** — MV3 background service worker. Handles cross-origin requests, extension lifecycle, and message routing from content scripts.
- **`shared.js`** — Shared state, utility functions, and UI primitives. Exports `forceNavigator` (the main state object), `ui` (DOM helpers), `safeSendMessage` (chrome.runtime wrapper), and lookup mode constants.
- **`popup.js`** — Extension toolbar popup.

### Key Patterns

- **`forceNavigator` object** in `shared.js` is the central state container. Properties like `forceNavigator.serverInstance`, `forceNavigator.sessionId`, and `forceNavigator.userId` are populated at init time from the Salesforce page context.
- **`ui` object** in `shared.js` holds DOM references (`searchBox`, `navOutput`, etc.) and methods for manipulating the command palette UI.
- **`safeSendMessage`** — Always use this instead of `chrome.runtime.sendMessage` directly; it guards against invalidated extension contexts.
- **DOM isolation** — All injected elements use `#sfnav`-prefixed IDs/classes to avoid CSS conflicts with Salesforce.
- **Lookup modes** (constants in `shared.js`): `LOOKUP_MODE_SHOW_COMMANDS`, `LOOKUP_MODE_COMPLETE_OBJECT_NAME`, `LOOKUP_MODE_SHOW_SEARCH_RESULTS` control how the palette interprets user input.

### Build System

Webpack config is split across `config/`:
- `webpack.common.js` — Shared config (output to `build/`, CSS extraction via MiniCssExtractPlugin, static asset copying from `public/`)
- `webpack.config.js` — Merges common config with entry points; source maps in dev only

### Localization

Uses `lisan` library. Locale files live in `src/languages/`. English strings are in `src/languages/en-US.js`. Use `t("key")` from lisan for any user-facing strings.

## Coding Standards

- **Naming:** `camelCase` for variables/functions, `UPPER_CASE_SNAKE` for constants
- **DOM manipulation:** Prefer `createElement`/`appendChild` over `innerHTML` to avoid XSS
- **Performance:** Debounce search input; cache Salesforce metadata to avoid redundant API calls
- **Salesforce APIs:** All fetch calls must use `https` and include the session cookie via `credentials: "include"`
- **Sandbox support:** The extension must correctly handle sandbox domain segments (e.g., `.sandbox`) in Salesforce URLs for session/URL handling
