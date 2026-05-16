import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="home">
      <nav className="navbar">
        <span className="nav-logo">VetEx</span>
        <div className="nav-actions">
          <span className="nav-email">{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main className="main">
        <h2>Listings</h2>
        <p>No listings yet. Be the first to post.</p>
      </main>
    </div>
  )
}