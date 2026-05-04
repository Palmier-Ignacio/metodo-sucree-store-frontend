import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAdminProduct, getAdminProductById, updateAdminProduct } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../utils/formatters'

const initialForm = {
  title: '',
  subtitle: '',
  description: '',
  price: '',
  type: 'ebook',
  cover_url: '',
  file_key: '',
  badge: '',
  status: 'draft',
  is_active: false,
  long_description: '',
  discount_percent: '',
  is_featured_home: false,
  featured_home_order: 0,
}

export default function AdminProductForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { getAccessToken } = useAuth()

  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return

    async function loadProduct() {
      try {
        const token = await getAccessToken()
        const product = await getAdminProductById(id, token)

        setForm({
          title: product.title || '',
          subtitle: product.subtitle || '',
          description: product.description || '',
          price: product.price || '',
          type: product.type || 'ebook',
          cover_url: product.cover_url || '',
          file_key: product.file_path || '',
          badge: product.badge || '',
          status: product.status || 'draft',
          is_active: Boolean(product.is_active),
          long_description: product.long_description || '',
          discount_percent: product.discount_percent || '',
          is_featured_home: Boolean(product.is_featured_home),
          featured_home_order: product.featured_home_order || 0,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id, isEditing, getAccessToken])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')

      const token = await getAccessToken()

      const payload = {
        ...form,
        price: Number(form.price),
        discount_percent: Number(form.discount_percent || 0),
        featured_home_order: Number(form.featured_home_order || 0),
      }

      if (isEditing) {
        await updateAdminProduct(id, payload, token)
      } else {
        await createAdminProduct(payload, token)
      }

      navigate('/admin/productos')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="empty-card"><h3>Cargando producto...</h3></div>

  const finalPrice =
    Number(form.price || 0) -
    (Number(form.price || 0) * Number(form.discount_percent || 0)) / 100

  return (
    <>
      <p className="eyebrow">{isEditing ? 'Editar' : 'Nuevo'}</p>
      <h1>{isEditing ? 'Editar producto' : 'Crear producto'}</h1>

      <form className="admin-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Título
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          Subtítulo
          <input name="subtitle" value={form.subtitle} onChange={handleChange} />
        </label>

        <label>
          Resumen
          <input name="description" value={form.description} onChange={handleChange} />
        </label>

        <label>
          Precio
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </label>

        <label>
          Descuento %
          <input
            name="discount_percent"
            type="number"
            min="0"
            max="100"
            value={form.discount_percent}
            onChange={handleChange}
            placeholder="Ej: 20"
          />
        </label>

        <div className="admin-price-preview">
          <span>Precio final con descuento</span>
          <strong>{money(finalPrice)}</strong>
        </div>

        <label>
          Tipo
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="ebook">Ebook</option>
            <option value="course">Curso</option>
          </select>
        </label>

        <label>
          URL de portada
          <input name="cover_url" value={form.cover_url} onChange={handleChange} />
        </label>

        <label>
          Descripción
          <textarea
            name="long_description"
            value={form.long_description || ''}
            onChange={handleChange}
            rows="8"
          />
        </label>

        <label>
          Archivo R2 / file key
          <input name="file_key" value={form.file_key} onChange={handleChange} placeholder="ebooks/archivo.pdf" />
        </label>

        <label>
          Badge
          <input name="badge" value={form.badge} onChange={handleChange} placeholder="Nuevo, Más vendido..." />
        </label>

        <label>
          Estado
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="inactive">Inactivo</option>
            <option value="archived">Archivado</option>
          </select>
        </label>

        <label className="admin-checkbox">
          <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
          Producto activo en la tienda
        </label>

        <label className="admin-checkbox">
          <input
            name="is_featured_home"
            type="checkbox"
            checked={form.is_featured_home}
            onChange={handleChange}
          />
          Mostrar en home
        </label>

        <label>
          Orden en home
          <select
            name="featured_home_order"
            value={form.featured_home_order}
            onChange={handleChange}
          >
            <option value="0">Sin orden</option>
            <option value="1">Posición 1</option>
            <option value="2">Posición 2</option>
            <option value="3">Posición 3</option>
          </select>
        </label>

        <button className="button" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar producto'}
        </button>
      </form>
    </>
  )
}