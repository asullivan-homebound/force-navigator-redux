# Coding Standards & Tech Stack

## Technology Stack

This project is a Google Chrome Extension (Manifest V3).

-   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3.
-   **Build System:** Webpack 5.
-   **Libraries:**
    -   `lisan`: For localization/i18n.
    -   `mousetrap`: For advanced keyboard shortcut handling.
-   **Platform:** Chrome Extension APIs (Manifest V3).
    -   `service_worker`: Background tasks.
    -   `content_scripts`: Injected UI and page interaction.
    -   `storage`: Saving user preferences (themes, toggles).
    -   `cookies` / `activeTab`: Session management and API access.

## Architecture

### Component Structure
-   **`contentScript.js`**: The core logic that runs on Salesforce pages. It injects the command palette DOM, handles user input, and communicates with the background script.
-   **`serviceWorker.js`**: (Background) Handles persistence, cross-origin requests (if necessary), and extension lifecycle events.
-   **`popup.js`**: Handles the extension's popup action (browser toolbar icon).
-   **`shared.js`**: Shared utility functions and constants.

### Data Flow
1.  **Initialization:** Content script detects Salesforce session.
2.  **Indexing:** The extension may query Salesforce APIs to build an index of available Setup pages, Objects, and specific user data.
3.  **Interaction:** User input in the command palette filters this index.
4.  **Execution:** Selecting an item triggers a `window.location` change or an API call (e.g., creating a Task).

## Coding Standards

### Formatting & Style
-   **Prettier:** Code is formatted using Prettier.
-   **Naming:**
    -   Variables/Functions: `camelCase` (e.g., `forceNavigator`, `launchMerger`).
    -   Constants: `UPPER_CASE_SNAKE` (e.g., `ID_RE`).
-   **Indentation:** Follows the `.editorconfig` and Prettier settings (likely 2 or 4 spaces/tabs).

### Best Practices
-   **Security:**
    -   Use `https` for all API calls.
    -   Respect Salesforce Session IDs and Security settings.
    -   Avoid `innerHTML` where possible to prevent XSS; prefer `createElement` / `appendChild`.
-   **Performance:**
    -   Debounce input in the search box.
    -   Cache metadata/indexes where possible to avoid redundant API calls.
-   **DOM Manipulation:**
    -   Keep the injected DOM isolated (unique IDs/Classes, e.g., `#sfnav...`) to avoid conflicts with Salesforce's own CSS/JS.

## Workflow

1.  **Development:**
    -   `npm run watch`: specific webpack build for dev.
2.  **Build:**
    -   `npm run build`: Production build (minified).
3.  **Release:**
    -   Update version in `package.json` and `manifest.json`.
    -   Build and zip the output for the Chrome Web Store.