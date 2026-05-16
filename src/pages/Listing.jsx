import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Listing() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [error, setError] = useState(null)
  const [images, setImages] = useState([null, null])
  const [previews, setPreviews] = useState([null, null])

  const CATEGORIES = ['business', 'casual', 'uniform', 'outerwear', 'footwear', 'accessories']

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) {
      setListing(data)
      setForm(data)
      setPreviews([data.image_url || null, data.image_url_2 || null])
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleCategory = (cat) => {
    const current = form.categories || []
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

  const handleSave = async () => {
    try {
      let image_url = form.image_url
      let image_url_2 = form.image_url_2

      if (images[0]) image_url = await uploadImage(images[0])
      if (images[1]) image_url_2 = await uploadImage(images[1])

      const { error } = await supabase
        .from('listings')
        .update({
          title: form.title,
          description: form.description,
          categories: form.categories,
          size: form.size,
          condition: form.condition,
          location: form.location,
          image_url,
          image_url_2,
        })
        .eq('id', id)

      if (error) throw error
      setListing({ ...form, image_url, image_url_2 })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    navigate('/')
  }

  if (loading) return <div className="listing-page"><p>Loading...</p></div>
  if (!listing) return <div className="listing-page"><p>Listing not found.</p></div>

  const isOwner = user?.id === listing.user_id

  return (
    <div className="listing-page">
      <div className="listing-detail">
        <button className="btn-back" onClick={() => navigate('/')}>← Back</button>

        {editing ? (
          <div className="edit-form">
            {error && <p className="error">{error}</p>}

            <div className="image-slots" style={{ marginBottom: '0.85rem' }}>
              {[0, 1].map(i => (
                <div key={i} className="image-slot">
                  {previews[i] && <img src={previews[i]} alt={`photo ${i + 1}`} className="image-preview" />}
                  <label className="btn-upload">
                    {previews[i] ? `Change photo ${i + 1}` : `Photo ${i + 1}`}
                    <input type="file" accept="image/*" onChange={(e) => handleImage(e, i)} hidden />
                  </label>
                </div>
              ))}
            </div>

            <input name="title" value={form.title} onChange={handleChange} />
            <textarea name="description" value={form.description} onChange={handleChange} />
            <div className="category-toggles">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`category-toggle ${form.categories?.includes(cat) ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input name="size" value={form.size} onChange={handleChange} />
            <select name="condition" value={form.condition} onChange={handleChange}>
              <option value="new">New</option>
              <option value="like new">Like new</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
            <input name="location" value={form.location} onChange={handleChange} />
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>Save</button>
              <button className="btn-cancel" onClick={() => { setEditing(false); setPreviews([listing.image_url || null, listing.image_url_2 || null]) }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="listing-detail-images">
              {listing.image_url && <img src={listing.image_url} alt={listing.title} />}
              {listing.image_url_2 && <img src={listing.image_url_2} alt={listing.title} />}
            </div>
            <div className="listing-detail-info">
              <h2>{listing.title}</h2>
              <p>{listing.description}</p>
              <div className="listing-meta">
                {listing.categories?.map(cat => <span key={cat}>{cat}</span>)}
                {listing.size && <span>{listing.size}</span>}
                {listing.condition && <span>{listing.condition}</span>}
                {listing.location && <span>{listing.location}</span>}
              </div>
              {isOwner && (
                <div className="owner-actions">
                  <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>
                  <button className="btn-delete" onClick={handleDelete}>Delete</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}