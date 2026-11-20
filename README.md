# CodeVault FTC — Java Library

A small, distinctive web app for saving, browsing, and sharing FTC Java code. It supports Java syntax highlighting, numbered lines, search, tags, Java source uploads, copying code, and exporting a vault backup.

## Try it locally

Open `index.html` in a modern browser, or serve this folder with any static web server. No build step is required.

## Publish a shareable website with GitHub Pages

1. Open this repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`, then save.
4. After GitHub finishes publishing, the site URL will appear on the Pages settings screen. It will look like `https://shadowbots-karthik.github.io/ftc-java-code-library/`.

## Important: where saved code lives

This starter app stores entries in the browser's `localStorage`. That means it does **not** upload code to a shared database: a teammate opening the public website gets their own empty vault, and saved entries are only available in the browser/device where they were added. Use **Export vault backup** to download a JSON backup. To make everyone's submissions show up in one shared vault, connect a database/backend before inviting people to contribute. Do not put database secret keys in this static site.

The app only accepts `.java` uploads and checks pasted text for common Java/FTC source constructs. This is a lightweight format check, not a full Java compiler.

## External assets

Fonts and Java syntax highlighting are loaded from Google Fonts and cdnjs when online. The core library and local saving work without a build system.
