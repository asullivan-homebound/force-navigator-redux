# Fix Duplicated Root URL Specification

- **User Story:** As a User, I want to navigate to an Object (Standard or Custom) without the URL domain being duplicated, so that I land on the correct page instead of a 404 error.

- **Acceptance Criteria:**
  - [ ] Navigation to Standard Objects (e.g., Account) results in a valid URL with a single domain prefix.
  - [ ] Navigation to Custom Objects (e.g., `Home_Listing__c`) results in a valid URL with a single domain prefix.
  - [ ] The fix works for both "current tab" and "new tab" (Ctrl+Enter) navigation actions.
  - [ ] No regression for other commands (e.g., Setup pages, Login As) that might share the same URL construction logic.

- **Technical Implementation:**

  - **Files to Modify:**
    - `src/shared.js` (Likely location of `forceNavigator` functions and URL constants).
    - `src/contentScript.js` (Where the navigation event `window.location.assign` or similar is triggered).

  - **Investigation & Logic:**
    1.  **Trace URL Construction:** Identify where the target URL is assembled. Look for concatenation logic like `baseUrl + commandUrl`.
    2.  **Identify the Culprit:**
        - Check if the command object itself already contains the full domain (absolute URL).
        - Check if the navigation function *unconditionally* prepends the domain (e.g., `forceNavigator.serverInstance`).
    3.  **Fix:**
        - If the command URL is relative (starts with `/`), ensure the base URL is prepended exactly once.
        - If the command URL is absolute (starts with `http` or `https`), do *not* prepend the base URL.
    4.  **Refactor (Optional):** Create a robust `navigateTo(url)` helper that sanitizes inputs.

- **Test Coverage:**
  - **Manual Verification:**
    - Open Command Palette -> Type "Account" -> Press Enter -> Check address bar.
    - Open Command Palette -> Type "Home_Listing__c" (if available) -> Press Enter -> Check address bar.
    - Open Command Palette -> Type "Setup" -> Press Enter -> Check address bar (Regression test).
