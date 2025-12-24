import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { Home, Maps, Programs, Calendar, Coaches, Profile, Settings, HealthCheck } from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/healthcheck" element={<HealthCheck />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

export default App
