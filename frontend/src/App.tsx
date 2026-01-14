import { Routes, Route } from 'react-router-dom'
import Layout from './components/shared/Layout'
import Dashboard from './pages/Dashboard'
import Pipelines from './pages/Pipelines'
import PipelineDetail from './pages/PipelineDetail'
import Documents from './pages/Documents'
import Search from './pages/Search'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/pipelines/:id" element={<PipelineDetail />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/search" element={<Search />} />
      </Routes>
    </Layout>
  )
}

export default App
