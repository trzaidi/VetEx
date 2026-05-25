import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function SetUsername() {
  const { user, fetchProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: username.trim(),
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      await fetchProfile(user.id)
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <h1>VetEx</h1>
        <p>Choose a username</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div className="login-buttons">
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}