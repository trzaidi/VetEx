import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Home from './pages/Home'
import NewListing from './pages/NewListing'
import Listing from './pages/Listing'

function App() {
  const { user } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/new" element={user ? <NewListing /> : <Navigate to="/login" />} />
        <Route path="/listing/:id" element={user ? <Listing /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App