# TCMSeek Web Frontend

[English](README.md) | [简体中文](README.zh-CN.md)

TCMSeek Web Frontend is the Vue 3 front-end application for the TCMSeek platform, a Traditional Chinese Medicine knowledge graph and large language model web system. It provides knowledge search, graph visualization, intelligent Q&A, molecular structure search, enrichment analysis, PPI hub protein analysis, X2K analysis, and target prediction workflows.

## Related Repositories

- Frontend: [TCMSeek-Web-Frontend](https://github.com/Able034/TCMSeek-Web-Frontend)
- Backend: [TCMSeek-Backend](https://github.com/Able034/TCMSeek-Backend)

## Features

- Knowledge graph visualization for herbs, formulas, compounds, genes, diseases, symptoms, syndromes, pathways, and phenotypes.
- Intelligent TCM Q&A with academic and general modes.
- TCM data browsing and detail pages for herbs, prescriptions, compounds, genes, medical cases, pathways, and related entities.
- Molecular structure search powered by ChemDoodle Web Components.
- Analysis tools for enrichment analysis, PPI Hub Proteins, X2K Analysis, and 3DSTarPred target prediction.
- Internationalization support for Chinese, English, and bilingual display modes.

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Vue I18n
- Element Plus
- Axios
- ECharts
- D3
- Sigma.js / Graphology
- ChemDoodle Web Components

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:8090` by default.

To use a different backend gateway:

```bash
VITE_GATEWAY_TARGET=http://localhost:8090
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```text
Frontend/
|-- public/                 # Static assets loaded directly by the browser
|-- src/
|   |-- api/                # API request modules
|   |-- assets/             # Images, icons, and global styles
|   |-- components/         # Reusable Vue components
|   |-- composables/        # Reusable composition functions
|   |-- i18n/               # Locale messages and i18n setup
|   |-- router/             # Route definitions and navigation guards
|   |-- utils/              # Request, auth, and RDKit helpers
|   `-- views/              # Page-level Vue components
|-- index.html
|-- package.json
|-- package-lock.json
`-- vite.config.js
```

## Environment

The application calls backend APIs through `/api/web`. In development, Vite proxies `/api` to the configured backend gateway.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_GATEWAY_TARGET` | No | `http://localhost:8090` | Backend gateway used by the Vite dev proxy |

## Repository Hygiene

This repository should contain only front-end source code and basic project configuration. The `.gitignore` excludes dependencies, build output, local logs, environment files, SQL files, extra Markdown documents, Office documents, PDFs, CSV/TSV exports, and compressed packages.

Before publishing this repository publicly, make sure no private data, credentials, database dumps, generated reports, or sensitive files exist in the tracked history.

## License

No license file is included yet. Add a `LICENSE` file before public distribution if the project needs an explicit open-source license.
