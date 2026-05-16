import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setListings(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="home">
      <nav className="navbar">
        <span className="nav-logo">VetEx</span>
        <div className="nav-actions">
          <button className="btn-post" onClick={() => navigate('/new')}>Post listing</button>
          <span className="nav-email">{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>
      <main className="main">
        <h2>Listings</h2>
        {loading && <p>Loading...</p>}
        {!loading && listings.length === 0 && <p>No listings yet. Be the first to post.</p>}
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing.id} className="listing-card">
              <div className="listing-images">
                {listing.image_url && (
                  <img src={listing.image_url} alt={listing.title} className="listing-image" />
                )}
                {listing.image_url_2 && (
                  <img src={listing.image_url_2} alt={listing.title} className="listing-image" />
                )}
              </div>
              <div className="listing-info">
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <div className="listing-meta">
                  {listing.categories && listing.categories.map(cat => <span key={cat}>{cat}</span>)}
                  {listing.size && <span>{listing.size}</span>}
                  {listing.condition && <span>{listing.condition}</span>}
                  {listing.location && <span>{listing.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}