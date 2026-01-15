# Fix Enhanced User Management Routing Specification

- **User Story:** As a Salesforce Administrator, I want the "Manage Users" command to navigate to the correct "All Users" list view (ManageUsersLightning) when Enhanced User Management is enabled, so that I don't land on a legacy or incorrect page.

- **Acceptance Criteria:**
  - [ ] The extension queries the `UserManagementSettings` metadata (or checks an appropriate signal) to determine if `enhancedUserListView` is true.
  - [ ] If Enhanced User Management is enabled (or if the check fails/defaults), the "Manage Users" command navigates to the `ManageUsersLightning` URL structure.
  - [ ] If Enhanced User Management is explicitly disabled, it preserves the legacy `ManageUsers` behavior (if applicable, otherwise default to new).
  - [ ] The fallback behavior is to use `ManageUsersLightning`.

- **Technical Implementation:**

  - **Files to Modify:**
    - `src/shared.js` (Likely where the navigation logic or command definitions reside).
    - `src/background.js` or `serviceWorker.js` (If the metadata check needs to happen via API in the background).

  - **API/Data:**
    - **Metadata API:** Query `UserManagementSettings` for the `enableEnhancedUserList` (or similar) field.
      - *Note:* Metadata API calls might require a specific session ID or permission. If a direct Metadata API call is too heavy, we might need to rely on the default behavior being the "Lightning" path as requested.
    - **Alternate Approach:** If a synchronous check is difficult during the command execution, update the static command map to prefer the new URL, or perform an async check on extension load.

  - **Logic:**
    1.  Identify the command entry for "Manage Users".
    2.  Implement a check (or update the default) to point to the Lightning-compatible URL.
    3.  The specific URL target for Enhanced User Management is typically `/lightning/setup/ManageUsersLightning/home`.
    4.  The legacy URL is typically `/lightning/setup/ManageUsers/home` (or Classic equivalent).

- **Test Coverage:**
  - **Manual Verification:**
    - Log in to an Org with Enhanced User Management enabled -> Run "Manage Users" -> Verify landing page.
    - Log in to an Org with Enhanced User Management disabled -> Run "Manage Users" -> Verify landing page.
