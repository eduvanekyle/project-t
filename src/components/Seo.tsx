import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_URL = 'https://weave.eduvane.info'

const SEO_BY_PATH: Record<string, { title: string; description: string }> = {
    '/': {
        title: 'Weave | Free online file tools',
        description: 'Convert, compress, merge, split, and transform Excel, PDF, image, and JSON files privately in your browser.',
    },
    '/image-tools': {
        title: 'Image Tools | Convert and Compress Images | Weave',
        description: 'Convert and compress PNG, JPG, and WebP images locally in your browser with Weave.',
    },
    '/pdf-tools': {
        title: 'PDF Tools | Merge, Split, Compress, and Sign PDFs | Weave',
        description: 'Merge, split, compress, convert, and sign PDF files online without uploading them.',
    },
    '/excel-tools': {
        title: 'Excel Tools | Convert, Merge, Split, and Unpivot | Weave',
        description: 'Convert, merge, split, unpivot, and reshape Excel and CSV files privately in your browser.',
    },
    '/excel-tools/converter': {
        title: 'Convert Excel to JSON, CSV, XLS, or XLSX | Weave',
        description: 'Convert XLSX, XLS, and CSV spreadsheets to Excel formats, CSV, or JSON without uploading files.',
    },
    '/excel-tools/unpivot': {
        title: 'Unpivot Excel Online | Weave',
        description: 'Unpivot Excel columns into attribute and value rows directly in your browser.',
    },
    '/excel-tools/json-to-csv': {
        title: 'Convert JSON to CSV Online | Weave',
        description: 'Convert JSON records to a CSV file locally and privately in your browser.',
    },
}

const DEFAULT_SEO = {
    title: 'Weave | Private file transformation tools',
    description: 'Browser-based tools for transforming files privately, including Excel, PDF, image, and JSON utilities.',
}

function setMeta(name: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!element) {
        element = document.createElement('meta')
        element.name = name
        document.head.appendChild(element)
    }
    element.content = content
}

function setProperty(property: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!element) {
        element = document.createElement('meta')
        element.setAttribute('property', property)
        document.head.appendChild(element)
    }
    element.content = content
}

export function Seo() {
    const { pathname } = useLocation()

    useEffect(() => {
        const seo = SEO_BY_PATH[pathname] ?? DEFAULT_SEO
        const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`
        document.title = seo.title
        setMeta('description', seo.description)
        setMeta('robots', 'index, follow')
        setProperty('og:title', seo.title)
        setProperty('og:description', seo.description)
        setProperty('og:type', 'website')
        setProperty('og:url', canonicalUrl)
        setProperty('og:site_name', 'Weave')

        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
        if (!canonical) {
            canonical = document.createElement('link')
            canonical.rel = 'canonical'
            document.head.appendChild(canonical)
        }
        canonical.href = canonicalUrl

        let structuredData = document.head.querySelector<HTMLScriptElement>('#weave-structured-data')
        if (!structuredData) {
            structuredData = document.createElement('script')
            structuredData.id = 'weave-structured-data'
            structuredData.type = 'application/ld+json'
            document.head.appendChild(structuredData)
        }
        structuredData.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Weave',
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            url: SITE_URL,
            description: seo.description,
        })
    }, [pathname])

    return null
}
