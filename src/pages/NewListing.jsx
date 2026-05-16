import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['business', 'casual', 'uniform', 'outerwear', 'footwear', 'accessories']

export default function NewListing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([null, null])
  const [previews, setPreviews] = useState([null, null])
  const [form, setForm] = useState({
    title: '',
    description: '',
    categories: [],
    size: '',
    condition: '',
    location: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleCategory = (cat) => {
    const current = form.categories
    if (current.includes(cat)) {
      setForm({ ...form, categories: current.filter(c => c !== cat) })
    } else {
      setForm({ ...form, categories: [...current, cat] })
    }
  }

  const handleImage = (e, index) => {
    const file = e.target.files[0]
    if (file) {
      const newImages = [...images]
      const newPreviews = [...previews]
      newImages[index] = file
      newPreviews[index] = URL.createObjectURL(file)
      setImages(newImages)
      setPreviews(newPreviews)
    }
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('listings').upload(filePath, file)
    if (error) throw error
    const { data } = supabase.storage.from('listings').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let image_url = null
      let image_url_2 = null

      if (images[0]) image_url = await uploadImage(images[0])
      if (images[1]) image_url_2 = await uploadImage(images[1])

      const { error } = await supabase.from('listings').insert({
        ...form,
        user_id: user.id,
        image_url,
        image_url_2,
      })

      if (error) throw error
      navigate('/')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="new-listing">
      <div className="form-card">
        <h2>Post a listing</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <div className="category-toggles">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-toggle ${form.categories.includes(cat) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <input name="size" placeholder="Size (e.g. M, 32x30, 10.5)" value={form.size} onChange={handleChange} />
          <select name="condition" value={form.condition} onChange={handleChange}>
            <option value="">Condition</option>
            <option value="new">New</option>
            <option value="like new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
          <input name="location" placeholder="City, State" value={form.location} onChange={handleChange} />

          <div className="image-upload">
            <div className="image-slots">
              {[0, 1].map(i => (
                <div key={i} className="image-slot">
                  {previews[i] && <img src={previews[i]} alt={`preview ${i + 1}`} className="image-preview" />}
                  <label className="btn-upload">
                    {previews[i] ? `Change photo ${i + 1}` : `Photo ${i + 1}`}
                    <input type="file" accept="image/*" onChange={(e) => handleImage(e, i)} hidden />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post listing'}
          </button>
        </form>
      </div>
    </div>
  )
}