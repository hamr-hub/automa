# Automa Project Analysis

## Overview
Automa is a browser extension for workflow automation. It allows users to visually connect blocks to automate tasks in the browser, such as auto-filling forms, scraping data, and taking screenshots.

## Architecture
The project follows the standard WebExtension architecture with Vue.js for the UI.

### Core Components
1.  **Background Service Worker (`src/background`)**: The central hub that manages workflow execution, triggers, and browser events. It coordinates between the UI and Content Scripts.
2.  **Workflow Engine (`src/workflowEngine`)**: The core logic responsible for parsing and executing workflows. It runs primarily in the background but coordinates with content scripts for page interactions.
3.  **Content Scripts (`src/content`)**: Scripts injected into web pages to perform actions (click, type, scrape) as directed by the Workflow Engine.
4.  **Dashboard (`src/newtab`)**: A Vue.js application where users create, edit, and manage workflows. It serves as the main interface.
5.  **Popup (`src/popup`)**: A lightweight Vue.js application for quick actions like viewing running workflows or starting a recording.

## Directory Structure
- `src/background`: Background scripts and event listeners.
- `src/content`: Content scripts for page interaction.
- `src/workflowEngine`: Core workflow execution logic.
- `src/newtab`: Dashboard UI (Vue.js).
- `src/popup`: Popup UI (Vue.js).
- `src/components`: Shared Vue components.
- `src/common` & `src/utils`: Shared utilities and constants.
- `src/stores`: State management using Pinia.
- `src/db`: IndexedDB management (Dexie.js) for storing workflows and logs.

## Technology Stack
- **Framework**: Vue.js 3
- **State Management**: Pinia
- **Build Tool**: Webpack
- **Extension API**: `webextension-polyfill` for cross-browser compatibility.
- **Styling**: TailwindCSS
- **Database**: Dexie.js (IndexedDB wrapper)
