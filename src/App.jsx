import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App