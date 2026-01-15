# Product Context

## Project Vision

**Force Navigator** (Salesforce Navigator for Lightning) is a productivity extension for Salesforce professionals. It acts as a "command palette" or "Spotlight search" for Salesforce, allowing users to navigate directly to pages, create records, and perform administrative tasks without clicking through complex menus. It is designed to work seamlessly in both Salesforce Classic and Lightning Experience.

## Target Audience (Personas)

1.  **The Administrator:** Salesforce Admins who need to quickly access Setup pages, Object Managers, and manage users (Login As).
2.  **The Developer:** Developers who need to refresh metadata, toggle between Classic/Lightning, and access technical configurations.
3.  **The Power User:** Sales/Service users who want to quickly create tasks, find records, or merge accounts without leaving their keyboard.

## Core User Flows

-   **Navigation:** User triggers the command palette (Ctrl+Shift+Space), types a page name (e.g., "Account Fields", "Deploy Status"), and hits Enter to navigate immediately.
-   **Quick Actions:** User commands the extension to perform an action, such as "New Task", "Merge Accounts", or "Login as [User]".
-   **Global Search:** User types `? [term]` to perform a global search across Salesforce records.
-   **Contextual Commands:** Commands like "Copy Record ID" or "Toggle Lightning" that act on the current session or page.

## Key Features

-   **Command Palette Interface:** Keyboard-centric UI for speed.
-   **Universal Compatibility:** Works in Classic and Lightning.
-   **Metadata Aware:** Can index and search Setup pages, Objects, and Fields.
-   **Productivity Tools:**
    -   "Login As" shortcut.
    -   "Merge Accounts" utility.
    -   "New [Object]" shortcuts.
    -   Theme support (Dark, Solarized, etc.).

## Tone & Vibe

-   **UI/UX:** Fast, unobtrusive, keyboard-first, utilitarian but polished.
-   **Philosophy:** "Don't make me click."
