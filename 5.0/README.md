# Salesforce Navigator Redux

> **This is a fork of the original [Salesforce Navigator for Lightning](https://chrome.google.com/webstore/detail/salesforce-navigator-for/pbjjdhghffpemcglcadejmkcpnpmlklh) Chrome extension.**
>
> This fork includes fixes to URL structures for Object Manager pages (using durable IDs) and User Management pages (using `ManageUsersLightning` for Enhanced User Management compatibility).

## Supports Lightning & Classic

Get more done in Salesforce - list and search records, make new ones, create a task or login as on the fly!
This extension helps you get to any Salesforce page quickly. Just type in what you need to do!
Compatible with Lightning and Classic

Open the Navigator and

-   [New Permission] Can now save some settings, like theme and profile setup toggle, needs Storage permission to save preferences
-   [New Feature] Themes! Right now has Default, Dark, Unicorn, and Solarized, open to suggestions
-   [New Feature] Toggle all checkboxes on the page for when subtracting from a selection is faster
-   [Fix] Better Classic to Lightning URL mapping
-   [Fix] Better loading checks so it won't error out trying to set the style of the search box
-   [Fix] Fetch Custom Object Durable IDs for Object Manager links
-   [Fix] Active Flow URL construction

-   Use the account merge tool by typing "Merge Accounts <optional Account ID>"
    Call the Classic Account Merge from either interface using the Account you are on and the Salesforce ID in your clipboard or entered into the command box. You can use a tool like Salesforce CopyPasteGo (https://summerlin.co/copypastego) to easily grab the ID of a Salesforce record
-   Add tasks on the fly by typing "! <your task>"
-   Search all records with "? <search terms>"
-   Go to your Home page with "Home"
-   Object List views with "List <Object>"
-   Create a new record with "New <Object>"
-   Go directly a Setup page by typing it's name
-   Access Object customizations with "<Object> <Section>" (e.g. "Contact Fields")
-   Switch between Lightning and Classic with "Toggle Lightning"
-   Commands looking weird? Run "Refresh Metadata" to make sure you have what you need
-   Login as another user with "Login as <partial match of username>"

** You can hold shift or control when you press enter or click your mouse to open the selected item in a new tab **

Default shortcut keys
(use Command instead of Control on Mac, and/or customize your options at chrome://extensions/shortcuts)

-   Control + Shift + Space: Navigator Bar
-   Control + Shift + A: Lightning App Menu
-   Control + Shift + 1: Tasks
-   Control + Shift + 2: Reports

NOTE: If you have a custom instance Domain Name, you may have to create a CSP Trusted Site Definition for your Classic domain URL in order for this extension to work - more info here https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/csp_trusted_sites.htm

Contribute to this extension at https://github.com/asullivan-homebound/force-navigator-redux

UPDATE NOTES
########################################
1/15/26 - Fixed sandbox environment support. The extension now correctly identifies and uses sandbox domain segments (e.g., `.sandbox`) for session and URL handling.
1/15/26 - Fixed Custom Object durable ID retrieval. The extension now queries the Tooling API to fetch the correct `01I` IDs for custom objects, ensuring Object Manager links work correctly in Lightning.
1/15/26 - Fixed user management links to work in Enhanced User Management. Fixed URL structure to prevent duplicate root URL paths.
1/15/26 - Fixed Active Flow URL construction. The extension now correctly constructs absolute URLs for active flows, ensuring they open in the Flow Builder successfully.

Maintainer(s):
[Alex Sullivan](https://alexandersullivan.com)
open to others!
_based on Salesforce Navigator by [Danny Summerlin](https://dannysummerlin.com)_

## Privacy Policy

This extension only runs locally in communication with your instance of Salesforce. No data is collected from any user, nor is extension activity tracked or reported to a third-party.

## Terms of Service

This extension is not intended to support the work of any individual or organization that is discriminatory or outright illegal.
