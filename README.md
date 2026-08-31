# Project T

A lightweight, privacy-friendly file utility web app. Convert images, compress files, merge PDFs, and turn PDF pages into images — all processed locally in your browser. No files are ever uploaded to a server.

## Features

### Image Tools
- **Image Converter** — Convert between PNG, JPG, and WebP with automatic format detection.
- **Image Compressor** — Adjust quality with a live before/after size comparison.

### PDF Tools
- **Merge PDF** — Drag and drop multiple PDFs, reorder them, and merge into one document.
- **PDF to Image** — Export PDF pages as PNG or JPG, individually or as a zip.

### Excel Tools
- **Excel Converter** — Convert between XLSX, XLS, and CSV with automatic format detection.
- **Merge Excel** — Combine multiple spreadsheets into one file, either by stacking rows or keeping each file as its own sheet.

All processing happens client-side using the Canvas API, [pdf-lib](https://github.com/Hopding/pdf-lib), [pdf.js](https://github.com/mozilla/pdf.js), and [SheetJS](https://github.com/SheetJS/sheetjs) — your files never leave your device.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [@dnd-kit](https://dndkit.com/) for drag-and-drop reordering
- [pdf-lib](https://github.com/Hopding/pdf-lib) & [pdf.js](https://github.com/mozilla/pdf.js) for PDF processing
- [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs) for Excel/CSV processing
- [JSZip](https://stuk.github.io/jszip/) for bundling downloads
- [lucide-react](https://lucide.dev/) for icons

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 20+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  components/   Reusable UI components
  lib/          Client-side image/PDF processing, theme, and shared utilities
  pages/        Route-level pages for each tool
  App.tsx       Route definitions
  main.tsx      App entry point
```

## License

MIT
