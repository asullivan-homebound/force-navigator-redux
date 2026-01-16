# Feature: App Home Link Specification

- **User Story:** As a user, I want a dedicated "App Home" command in the palette that takes me directly to the Lightning App Home page (`/lightning/page/home#/`), regardless of whether I am currently in Setup, a Visualforce page, or a Sandbox environment.
- **Acceptance Criteria:**
    - [ ] A new command "App Home" is available in the command palette.
    - [ ] Searching for "Home" should include "App Home" in the results.
    - [ ] Clicking "App Home" navigates to `https://[domain].lightning.force.com/lightning/page/home#/`.
    - [ ] In Sandbox environments, it navigates to `https://[domain].sandbox.lightning.force.com/lightning/page/home#/`.
    - [ ] The command uses the cached `forceNavigator.serverInstance` to ensure the correct domain is used without regression or manual reconstruction errors.

- **Technical Implementation:**

  - **`src/shared.js`**:
    - **`invokeCommand`**: Add a case for `commands.appHome`.
      - Logic: `targetUrl = "https://" + forceNavigator.serverInstance + "/lightning/page/home#/"`
      - *Note:* `forceNavigator.serverInstance` already includes the full hostname (including `.sandbox` if applicable) and the correct domain suffix.
    - **`resetCommands`**: Add `"commands.appHome"` to the list of default commands to ensure it is initialized.

  - **`src/languages/en-US.js`**:
    - Add `"commands.appHome": "App Home"` to the translation map.

- **Test Coverage:**
  - **Manual Verification:**
    - Open extension in Production -> Select "App Home" -> Verify URL.
    - Open extension in Sandbox -> Select "App Home" -> Verify URL.
    - Open extension in Setup -> Select "App Home" -> Verify it redirects to the main App domain.
