import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { ExcelConverter } from './pages/ExcelConverter'
import { ExcelToolsOverview } from './pages/ExcelToolsOverview'
import { Home } from './pages/Home'
import { ImageCompressor } from './pages/ImageCompressor'
import { ImageConverter } from './pages/ImageConverter'
import { ImageToolsOverview } from './pages/ImageToolsOverview'
import { MergeExcel } from './pages/MergeExcel'
import { MergePdf } from './pages/MergePdf'
import { NotFound } from './pages/NotFound'
import { PdfToImage } from './pages/PdfToImage'
import { PdfToolsOverview } from './pages/PdfToolsOverview'
import { PdfCompressor } from './pages/PdfCompressor'
import { SignPdf } from './pages/SignPdf'

function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/image-tools" element={<ImageToolsOverview />} />
          <Route path="/image-tools/converter" element={<ImageConverter />} />
          <Route path="/image-tools/compressor" element={<ImageCompressor />} />
          <Route path="/pdf-tools" element={<PdfToolsOverview />} />
          <Route path="/pdf-tools/merge" element={<MergePdf />} />
          <Route path="/pdf-tools/compressor" element={<PdfCompressor />} />
          <Route path="/pdf-tools/to-image" element={<PdfToImage />} />
          <Route path="/pdf-tools/sign" element={<SignPdf />} />
          <Route path="/excel-tools" element={<ExcelToolsOverview />} />
          <Route path="/excel-tools/converter" element={<ExcelConverter />} />
          <Route path="/excel-tools/merge" element={<MergeExcel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App


