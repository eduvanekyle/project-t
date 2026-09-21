export interface ToolMeta {
    slug: string
    name: string
    description: string
    category: 'image' | 'pdf' | 'excel'
    path: string
}

export const tools: ToolMeta[] = [
    {
        slug: 'image-converter',
        name: 'Image Converter',
        description: 'Convert PNG, JPG, and WebP images.',
        category: 'image',
        path: '/image-tools/converter',
    },
    {
        slug: 'image-compressor',
        name: 'Image Compressor',
        description: 'Reduce image file size while controlling quality.',
        category: 'image',
        path: '/image-tools/compressor',
    },
    {
        slug: 'merge-pdf',
        name: 'Merge PDF',
        description: 'Combine multiple PDF files into one document.',
        category: 'pdf',
        path: '/pdf-tools/merge',
    },
    {
        slug: 'pdf-compressor',
        name: 'PDF Compressor',
        description: 'Reduce PDF file size while preserving document content.',
        category: 'pdf',
        path: '/pdf-tools/compressor',
    },
    {
        slug: 'pdf-to-image',
        name: 'PDF to Image',
        description: 'Convert PDF pages into JPG or PNG images.',
        category: 'pdf',
        path: '/pdf-tools/to-image',
    },
    {
        slug: 'split-pdf',
        name: 'Split PDF',
        description: 'Extract page ranges or split every page into its own file.',
        category: 'pdf',
        path: '/pdf-tools/split',
    },
    {
        slug: 'sign-pdf',
        name: 'Sign PDF',
        description: 'Place a signature image onto a PDF page.',
        category: 'pdf',
        path: '/pdf-tools/sign',
    },
    {
        slug: 'excel-converter',
        name: 'Excel Converter',
        description: 'Convert between XLSX, XLS, and CSV files.',
        category: 'excel',
        path: '/excel-tools/converter',
    },
    {
        slug: 'merge-excel',
        name: 'Merge Excel',
        description: 'Combine multiple spreadsheets into one file.',
        category: 'excel',
        path: '/excel-tools/merge',
    },
    {
        slug: 'smart-merge-excel',
        name: 'Smart Merge Excel',
        description: 'Merge spreadsheets with different or reordered headers.',
        category: 'excel',
        path: '/excel-tools/smart-merge',
    },
    {
        slug: 'split-excel',
        name: 'Split Excel',
        description: 'Turn every sheet in a workbook into its own file.',
        category: 'excel',
        path: '/excel-tools/split',
    },
    {
        slug: 'unpivot-excel',
        name: 'Unpivot Excel',
        description: 'Turn columns into attribute and value rows.',
        category: 'excel',
        path: '/excel-tools/unpivot',
    },
    {
        slug: 'json-to-csv',
        name: 'JSON to CSV',
        description: 'Convert JSON records into a CSV file.',
        category: 'excel',
        path: '/excel-tools/json-to-csv',
    },
]
