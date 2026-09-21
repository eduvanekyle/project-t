# Weave

A lightweight, privacy-friendly file utility web app for reshaping and transforming files. Weave converts images, compresses files, merges PDFs, and transforms spreadsheets, all locally in your browser. No files are ever uploaded to a server.

## Features

### Image Tools

- **Image Converter:** Convert between PNG, JPG, and WebP with automatic format detection.
- **Image Compressor:** Adjust quality with a live before/after size comparison.

### PDF Tools

- **Merge PDF:** Drag and drop multiple PDFs, reorder them, and merge into one document.
- **PDF Compressor:** Reduce PDF file size while preserving document content.
- **PDF to Image:** Export PDF pages as PNG or JPG, individually or as a zip.
- **Split PDF:** Extract page ranges or split every page into its own file.

### Excel Tools

- **Excel Converter:** Convert XLSX, XLS, and CSV files to Excel formats, CSV, or JSON.
- **Merge Excel:** Combine multiple spreadsheets into one file, either by stacking rows or keeping each file as its own sheet.
- **Smart Merge Excel:** Merge spreadsheets by matching column headers instead of position, so files with reordered or mismatched columns still align correctly. New headers are added automatically, and a "Source File" column tracks which file each row came from.
- **Split Excel:** Turn every visible sheet in a workbook into its own file, skipping hidden sheets.
- **Unpivot Excel:** Turn selected spreadsheet columns into identifier, attribute, and value rows, with an option to skip null values.
- **JSON to CSV:** Convert JSON records into a CSV file, with a 30 MB limit.

All processing happens client-side using the Canvas API, [pdf-lib](https://github.com/Hopding/pdf-lib), [pdf.js](https://github.com/mozilla/pdf.js), and [SheetJS](https://github.com/SheetJS/sheetjs), so your files never leave your device.

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
