# Fix Custom Object URLs with Durable ID Specification

- **User Story:** As an Admin, I want custom object links in the navigator to use the Durable ID (e.g., `01I...`) instead of the API Name (e.g., `Obj__c`) in the URL, so that the `ObjectManager` page loads correctly without errors in Salesforce Lightning.
- **Acceptance Criteria:**
    - [ ] When valid custom objects are indexed, an additional Tooling API query fetches their `DurableId`.
    - [ ] The generated URL for a custom object Setup page follows the pattern: `/lightning/setup/ObjectManager/<DurableID>/<Page>/view`.
    - [ ] Standard objects continue to use their API Name (e.g., `Account`, `Case`).
    - [ ] If the Tooling API fetch fails, the system falls back to using the API Name (current behavior) and logs the error.
    - [ ] The feature works for organizations with a large number of custom objects (batching requests if necessary).

- **Technical Implementation:**

  - **`src/background.js`**:
    - Modify the `getMetadata` message handler.
    - After the initial `sobjects` fetch, filter the list for Custom Objects (ending in `__c`).
    - Construct and execute a Tooling API query: `SELECT Id, DeveloperName FROM CustomObject WHERE DeveloperName IN ('...')`.
      - *Note:* The `sobjects` response gives `MyObj__c`. The Tooling API `DeveloperName` is `MyObj`. We must strip the `__c` suffix for the query or map carefully.
    - Handle potential URL length limits by chunking the query if there are many custom objects (e.g., > 100).
    - Create a map `durableIdMap` (Key: API Name `MyObj__c`, Value: Durable ID `01I...`).
    - Pass this map to `parseMetadata`.

  - **`src/shared.js`**:
    - Update `parseMetadata` to accept `durableIdMap` and pass it to `createSObjectCommands`.
    - Update `forceNavigator.createSObjectCommands`:
      - Accept `durableIdMap`.
      - Determine the correct identifier for the URL:
        ```javascript
        let objectIdForUrl = name;
        if (durableIdMap && durableIdMap[name]) {
            objectIdForUrl = durableIdMap[name];
        }
        // ... use objectIdForUrl in targetUrl construction
        ```

- **Test Coverage:**
  - **Unit Tests:**
    - `parseMetadata`: Verify it correctly passes the map.
    - `createSObjectCommands`: Verify it uses the Durable ID when present in the map, and falls back to API Name when missing.
  - **Integration:**
    - Manual verification that clicking a Custom Object "Fields & Relationships" link opens the correct URL in Salesforce.
