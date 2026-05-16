import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
  }

  return (
    <div className="login">
      <div className="login-card">
        <h1>VetEx</h1>
        <p>The Veteran Exchange</p>
        {error && <p className="error">{error}</p>}
        <form>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="login-buttons">
            <button className="btn-login" onClick={handleLogin}>Log in</button>
            <button className="btn-signup" onClick={handleSignup}>Sign up</button>
          </div>
        </form>
      </div>
    </div>
  )
}