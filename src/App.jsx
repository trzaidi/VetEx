import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <div>Welcome {user.email}</div> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
