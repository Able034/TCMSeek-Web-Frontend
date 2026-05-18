# TCMSeek Web Frontend

[English](README.md) | [简体中文](README.zh-CN.md)

TCMSeek Web Frontend is the Vue 3 front-end application for the TCMSeek platform, a Traditional Chinese Medicine knowledge graph and large language model web system. It provides knowledge search, graph visualization, intelligent Q&A, molecular structure search, enrichment analysis, PPI hub protein analysis, X2K analysis, and target prediction workflows.

## Demo

Demo link: [http://120.79.220.11/#/](http://120.79.220.11/#/)

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

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element%20Plus-UI-409EFF?logo=element&logoColor=white)
![Vue Router](https://img.shields.io/badge/Vue%20Router-4-42b883?logo=vuedotjs&logoColor=white)
![Vue I18n](https://img.shields.io/badge/Vue%20I18n-9-42b883?logo=vuedotjs&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white)
![ECharts](https://img.shields.io/badge/ECharts-5-AA344D)
![D3.js](https://img.shields.io/badge/D3.js-7-F9A03C?logo=d3dotjs&logoColor=white)
![Sigma.js](https://img.shields.io/badge/Sigma.js-Graph-2D74DA)
![Graphology](https://img.shields.io/badge/Graphology-Network-222222)
![ChemDoodle](https://img.shields.io/badge/ChemDoodle-Web%20Components-0B7285)

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
