import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/Layout/Sidebar'
import { ToastContainer } from './components/UI/Toast'
import {
  Projects,
  ProjectDashboard,
  Knowledge,
  Experiments,
  ExperimentDetail,
  Configurations,
  Settings,
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
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDashboard />} />
          <Route path="/projects/:projectId/knowledge" element={<Knowledge />} />
          <Route path="/projects/:projectId/experiments" element={<Experiments />} />
          <Route path="/projects/:projectId/experiments/:experimentId" element={<ExperimentDetail />} />
          <Route path="/projects/:projectId/configs" element={<Configurations />} />
          <Route path="/projects/:projectId/settings" element={<Settings />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </AppLayout>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
