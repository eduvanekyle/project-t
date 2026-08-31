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
        slug: 'pdf-to-image',
        name: 'PDF to Image',
        description: 'Convert PDF pages into JPG or PNG images.',
        category: 'pdf',
        path: '/pdf-tools/to-image',
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
]
