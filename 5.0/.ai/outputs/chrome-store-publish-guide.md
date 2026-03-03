# Chrome Web Store: Publishing to a Private Group

This guide covers publishing **Salesforce Navigator Redux** to the Chrome Web Store and distributing it to a private trusted tester group.

---

## Prerequisites

- A Google account enrolled in the [Chrome Web Store Developer Program](https://chrome.google.com/webstore/devconsole)
  - One-time $5 USD registration fee required
- The extension built and zipped (see **Step 1** below)

---

## Step 1: Build & Package the Extension

Run the publish script from the project root. This builds the production bundle, zips it, and opens the output folder in Finder:

```bash
npm run zip
```

The zip file will be created at `dist/force-navigator-redux-<version>.zip` (e.g. `dist/force-navigator-redux-5.0.4.zip`).

> **Version sync reminder:** Before building, confirm the `version` field matches in both `package.json` and `public/manifest.json`. The zip filename is derived from `package.json`.

---

## Step 2: Chrome Web Store Developer Dashboard

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Sign in with your developer Google account.

---

## Step 3: Upload the Package

### For a new listing:
1. Click **+ New Item** (top right).
2. Drag and drop (or browse to) the `.zip` file from the `dist/` folder.
3. Click **Upload**. The dashboard will parse the manifest and pre-fill the listing.

### For an update to an existing listing:
1. Click the extension name in the dashboard.
2. Go to **Package** → **Upload new package**.
3. Select the new `.zip` and upload.

---

## Step 4: Configure Visibility — Private Group Distribution

1. In the left sidebar, click **Distribution**.
2. Under **Visibility**, select **Private**.
3. Under **Distribution**, choose **Trusted Testers** to limit access to a specific Google Group:
   - Enter the email address of the Google Group (e.g. `my-team@googlegroups.com`).
   - Only members of that group will be able to find and install the extension.
   - If you don't have a Google Group yet, create one at [groups.google.com](https://groups.google.com) first.
4. Alternatively, select **Unlisted** if you want to share via direct link without a group.

> **Tip:** Members of the trusted tester group must be signed into Chrome with the Google account that belongs to the group to see and install the extension.

---

## Step 5: Complete the Store Listing

Fill in the required fields under the **Store listing** tab:

| Field | Suggested value |
|---|---|
| **Name** | Salesforce Navigator Redux |
| **Short description** (132 chars) | A command palette for Salesforce — navigate Setup pages, create records, and run admin tasks from your keyboard. |
| **Category** | Productivity |
| **Language** | English |
| **Screenshots** | At least 1 screenshot (1280×800 or 640×400 px) |
| **Small promo tile** | 440×280 px (optional but recommended) |
| **Icon** | Already included in the package (`images/sf-navigator128.png`) |

### Long Description

Paste the following into the **Detailed description** field (limit: 16,000 characters):

---

Salesforce Navigator Redux is a keyboard-first command palette for Salesforce professionals. Open it with a shortcut, type what you need, and go — no clicking through menus required. Works in both Lightning Experience and Salesforce Classic.

**How it works**

Press Ctrl+Shift+Space (Cmd+Shift+Space on Mac) to open the Navigator from any Salesforce page. Start typing the name of a Setup page, an object, or a command, and matching results appear instantly. Press Enter to navigate, or hold Shift/Ctrl while pressing Enter (or clicking) to open the result in a new tab.

**Navigation**

Jump directly to any Salesforce Setup page by typing its name — no more hunting through the Setup menu. Type an object name to go straight to its list view, or pair it with a section (e.g. "Contact Fields", "Account Validation Rules") to land on the exact configuration page you need.

**Quick Actions**

- **New [Object]** — Open the create form for any standard or custom object instantly.
- **List [Object]** — Go directly to the default list view for any object.
- **Home** — Navigate to your Salesforce Home page.
- **App Home** — Go directly to the current Lightning App's home page.
- **Toggle Lightning** — Switch between Lightning Experience and Salesforce Classic without digging through the user menu.
- **Refresh Metadata** — Re-index your org's metadata if commands or objects seem out of date.

**Productivity Utilities**

- **! [subject]** — Create a new Task on the fly, right from the command bar.
- **? [search terms]** — Run a global search across all Salesforce records.
- **Login as [username]** — Quickly log in as another user using a partial username match (requires appropriate admin permissions).
- **Merge Accounts [optional ID]** — Launch the Classic Account Merge wizard using the record you're currently on and an ID from your clipboard or typed directly into the bar.
- **Copy Record ID** — Copy the Salesforce record ID of the current page to your clipboard.

**Object Manager**

Access custom and standard object configuration pages in a single keystroke. Supports Lightning-native Object Manager links with correct durable IDs for custom objects.

**Flow Builder**

Open active Flows directly in Flow Builder with correctly constructed absolute URLs — no broken links.

**User Management**

Compatible with Enhanced User Management. User management links use the correct URL structure for both standard and enhanced user management.

**Sandbox Support**

Correctly identifies and handles sandbox domain segments (e.g. `.sandbox`, `.scratch`) so all session handling and URL construction works across production and sandbox orgs without any configuration.

**Theme Support**

Choose from multiple UI themes (Default, Dark, Solarized, and more) to match your workflow preferences. Theme settings persist across sessions via Chrome storage.

**Keyboard Shortcuts**

All shortcuts are customizable at chrome://extensions/shortcuts.

| Shortcut | Action |
|---|---|
| Ctrl+Shift+Space | Open the Navigator command bar |
| Ctrl+Shift+A | Open the Lightning App Menu |
| Ctrl+Shift+1 | Quick-open Tasks |
| Ctrl+Shift+2 | Quick-open Reports |

**Privacy**

This extension operates entirely within your browser and communicates only with your own Salesforce instance using your existing authenticated session. No data is collected, stored externally, or shared with any third party, including the developer.

**Open Source**

This is a community-maintained fork of the original Salesforce Navigator for Lightning. Contributions and issue reports are welcome on GitHub.

---

### Permission Justifications

The Chrome Web Store **Privacy practices** tab requires a written justification for each sensitive permission. Copy the text below into the corresponding fields.

#### `activeTab`
> The extension reads the URL and DOM of the active Salesforce tab to extract the current record ID, determine the org instance URL, and inject the command palette UI. Access is limited to the tab the user is actively interacting with and only on Salesforce domains.

#### `management`
> Used to detect whether other Salesforce-related extensions are installed so the Navigator can surface relevant compatibility information and avoid conflicts with extensions that modify the same Salesforce pages.

#### `storage`
> Stores user preferences locally in Chrome — including selected UI theme, toggle states, and cached Salesforce metadata (Setup page index, object list). No data is synced externally or shared with any server.

#### `clipboardRead`
> Required for the "Merge Accounts" command, which reads a Salesforce record ID from the clipboard so the user can paste it as the merge target without manually retyping it.

#### `cookies`
> Required to read the active Salesforce session cookie (`sid`) from the current org domain. This session token is used to make authenticated Salesforce API calls (e.g. querying for users, fetching object metadata, creating tasks) on behalf of the user. No cookies are stored, forwarded, or accessed outside of the user's Salesforce domain.

#### `scripting`
> Used to programmatically inject the command palette UI and keyboard shortcut listeners into Salesforce pages. This is necessary because Salesforce's Lightning framework dynamically replaces page content and the extension must re-initialize its UI after navigation events.

#### Host permissions (`*.force.com`, `*.salesforce.com`, `*.cloudforce.com`)
> The extension operates exclusively on Salesforce domains. Host permissions are required to inject the content script UI, read session information, and make authenticated API calls to the user's specific Salesforce instance (which varies per org and may be a custom subdomain on these base domains).

---

The **Privacy practices** tab also requires a privacy policy URL. See `github-pages-privacy-policy.md` in this folder for instructions on hosting one.

---

## Step 6: Submit for Review

1. Click **Save draft** to preserve your changes at any point.
2. When all required fields are complete, click **Submit for review**.
3. Google's automated review typically takes **a few hours to a few days** for private/trusted-tester extensions.
4. You'll receive an email when the review is complete.

---

## Step 7: Installing as a Trusted Tester

Once published, members of the trusted tester Google Group can install the extension:

1. Sign into Chrome with the Google account that belongs to the group.
2. Go to the direct Chrome Web Store link for the extension (find it in the dashboard under **Store listing** → **Your listing on Chrome Web Store**).
3. Click **Add to Chrome**.

---

## Subsequent Updates

1. Increment the version number in **both** `package.json` and `public/manifest.json`.
2. Run `npm run zip`.
3. In the dashboard, go to **Package** → **Upload new package** and upload the new zip.
4. Click **Submit for review**.

Existing users will receive the update automatically once the new version is approved.

---

## Useful Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Publish in the Chrome Web Store (official docs)](https://developer.chrome.com/docs/webstore/publish/)
- [Trusted Testers distribution (official docs)](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution/)
- [Google Groups](https://groups.google.com)
