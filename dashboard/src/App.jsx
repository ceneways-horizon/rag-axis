import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Layout/Sidebar'
import { ToastContainer } from './components/UI/Toast'
import {
  Overview,
  Corpora,
  CorpusDetail,
  Experiments,
  ExperimentDetail,
  ExperimentCompare,
  Playground,
  Runs,
  Health,
} from './pages'

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-56 p-6 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/corpora" element={<Corpora />} />
          <Route path="/corpora/:corpusId" element={<CorpusDetail />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/experiments/compare" element={<ExperimentCompare />} />
          <Route path="/experiments/:expId" element={<ExperimentDetail />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/runs" element={<Runs />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
