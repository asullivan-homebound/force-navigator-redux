# Force Navigator (Salesforce Navigator Redux)

This repository contains the source code for the Force Navigator Chrome extension, a powerful productivity tool for Salesforce professionals.

## Project Structure

This project is organized into versioned directories:

-   **[4.11](./4.11)**: This directory contains the last version of the Chrome extension at the time of the fork. It is preserved for reference and legacy support.
-   **[5.0](./5.0)**: This is the updated and actively maintained version of the extension, featuring modern enhancements and fixes.

## Getting Started (Version 5.0)

To use the latest version of Force Navigator, follow these steps:

### 1. Download the Code

Clone the repository or download the source code as a ZIP file and extract it.

### 2. Build the Extension

Navigate to the `5.0` directory and run the build command:

```bash
cd 5.0
npm install
npm run build
```

This will create a `build` folder inside the `5.0` directory.

### 3. Install in Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `build` folder located at `5.0/build` in your local project directory.

The extension should now be active and ready for use.

---

For more details on features and usage, see the [5.0 README](./5.0/README.md).
