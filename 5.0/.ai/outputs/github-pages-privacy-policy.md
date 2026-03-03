# GitHub Pages: Privacy Policy Page

A quick way to host a public privacy policy URL for the Chrome Web Store listing.

---

## Step 1: Create a repo (or use an existing one)

You can add this to any existing public GitHub repo (e.g. `force-navigator-redux`), or create a dedicated one (e.g. `privacy`).

If creating a new repo:
1. Go to [github.com/new](https://github.com/new)
2. Name it `privacy` (or any name you like)
3. Set it to **Public**
4. Check **Add a README file**
5. Click **Create repository**

---

## Step 2: Create the privacy policy page

In the repo, create a file named `index.html` at the root with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy – Salesforce Navigator Redux</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      max-width: 680px;
      margin: 60px auto;
      padding: 0 24px;
      color: #222;
      line-height: 1.7;
    }
    h1 { font-size: 1.6rem; margin-bottom: 0.25em; }
    p.meta { color: #666; font-size: 0.9rem; margin-top: 0; }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="meta">Salesforce Navigator Redux &mdash; Last updated: January 2026</p>

  <p>
    Salesforce Navigator Redux is a browser extension that runs entirely within
    your browser and communicates solely with your own Salesforce instance.
  </p>

  <p>
    <strong>No data collection.</strong> This extension does not collect, store,
    transmit, or share any personal data, usage data, or telemetry with any
    third party, including the developer.
  </p>

  <p>
    <strong>No tracking.</strong> Extension activity is not tracked or reported
    to any external service.
  </p>

  <p>
    <strong>Local operation only.</strong> All functionality operates locally in
    your browser. Any requests made by the extension are directed exclusively to
    your authenticated Salesforce session using your existing browser cookies &mdash;
    no credentials are stored or transmitted elsewhere.
  </p>

  <p>
    If you have questions, contact the maintainer via
    <a href="https://github.com/asullivan-homebound/force-navigator-redux/issues">GitHub Issues</a>.
  </p>
</body>
</html>
```

To create the file on GitHub:
1. In the repo, click **Add file → Create new file**
2. Name it `index.html`
3. Paste the content above
4. Click **Commit changes**

---

## Step 3: Enable GitHub Pages

1. In the repo, go to **Settings → Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Set branch to `main` (or `master`), folder to `/ (root)`
4. Click **Save**

GitHub will display your live URL — it will look like:

```
https://<your-username>.github.io/<repo-name>/
```

For example: `https://asullivan-homebound.github.io/privacy/`

It typically goes live within 1–2 minutes.

---

## Step 4: Add the URL to the Chrome Web Store

Paste your GitHub Pages URL into the **Privacy policy URL** field in the Chrome Web Store Developer Dashboard under **Store listing**.
