import { useEffect, useState } from 'react'
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  updateAdminBanner,
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const initialForm = {
  title: '',
  image_url: '',
  alt_text: '',
  link_url: '',
  is_active: false,
}

export default function AdminBanners() {
  const { getAccessToken } = useAuth()
  const [banners, setBanners] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadBanners(nextPage = pagination.page) {
    try {
      setLoading(true)
      setError('')
      const token = await getAccessToken()
      const data = await getAdminBanners(token, { page: nextPage, pageSize: 20 })
      setBanners(data.banners || data.items || data.data || data || [])
      setPagination({
        page: data.page || nextPage,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners(1)
  }, [])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function editBanner(banner) {
    setEditingId(banner.id)
    setForm({
      title: banner.title || '',
      image_url: banner.image_url || '',
      alt_text: banner.alt_text || '',
      link_url: banner.link_url || '',
      is_active: Boolean(banner.is_active),
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(initialForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      const token = await getAccessToken()

      if (editingId) {
        await updateAdminBanner(editingId, form, token)
      } else {
        await createAdminBanner(form, token)
      }

      resetForm()
      await loadBanners(pagination.page)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function activateBanner(banner) {
    try {
      setError('')
      const token = await getAccessToken()
      await updateAdminBanner(banner.id, { ...banner, is_active: true }, token)
      await loadBanners(pagination.page)
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeBanner(id) {
    try {
      setError('')
      const token = await getAccessToken()
      await deleteAdminBanner(id, token)
      await loadBanners(pagination.page)
    } catch (err) {
      setError(err.message)
    }
  }


  function PaginationControls() {
    if (pagination.totalPages <= 1) return null

    return (
      <div className="admin-actions admin-toolbar">
        <button
          className="button button--small button--outline"
          disabled={pagination.page <= 1 || loading}
          onClick={() => loadBanners(pagination.page - 1)}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages} · {pagination.total} banners</span>
        <button
          className="button button--small button--outline"
          disabled={pagination.page >= pagination.totalPages || loading}
          onClick={() => loadBanners(pagination.page + 1)}
        >
          Siguiente
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Home</p>
          <h1>Banners</h1>
        </div>
      </div>

      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Editar banner' : 'Nuevo banner'}</h2>

        <label>
          Título interno
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label>
          URL de imagen
          <input name="image_url" type="url" value={form.image_url} onChange={handleChange} required />
        </label>

        <label>
          Texto alternativo
          <input name="alt_text" value={form.alt_text} onChange={handleChange} />
        </label>

        <label>
          Link del banner
          <input name="link_url" type="url" value={form.link_url} onChange={handleChange} placeholder="https://..." />
        </label>

        <label className="admin-checkbox">
          <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} />
          Mostrar este banner en el home
        </label>

        {form.image_url && (
          <div className="banner-preview">
            <span>Preview</span>
            <img src={form.image_url} alt={form.alt_text || form.title || 'Preview banner'} />
          </div>
        )}

        <div className="admin-actions">
          <button className="button" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear banner'}
          </button>

          {editingId && (
            <button className="button button--outline" type="button" onClick={resetForm}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {loading && <div className="empty-card"><h3>Cargando banners...</h3></div>}

      {!loading && (
        <>
          <PaginationControls />
          <div className="admin-table admin-responsive-table">
          <h2>Banners cargados</h2>

          <table>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Título</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <img className="admin-banner-thumb" src={banner.image_url} alt={banner.alt_text || banner.title || 'Banner'} />
                  </td>
                  <td>{banner.title}</td>
                  <td>{banner.is_active ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <button onClick={() => editBanner(banner)}>Editar</button>
                      <button onClick={() => activateBanner(banner)}>Activar</button>
                      <button onClick={() => removeBanner(banner.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}

              {banners.length === 0 && (
                <tr>
                  <td colSpan="4">No hay banners cargados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-mobile-list">
          {banners.map((banner) => (
            <article className="admin-mobile-card" key={banner.id}>
              <img className="admin-banner-mobile-preview" src={banner.image_url} alt={banner.alt_text || banner.title || 'Banner'} />
              <h3>{banner.title}</h3>

              <div className="admin-mobile-row">
                <span>Activo</span>
                <strong>{banner.is_active ? 'Sí' : 'No'}</strong>
              </div>

              <div className="admin-mobile-actions">
                <button className="button button--small button--outline" onClick={() => editBanner(banner)}>Editar</button>
                <button className="button button--small" onClick={() => activateBanner(banner)}>Activar</button>
                <button className="button button--small button--outline" onClick={() => removeBanner(banner.id)}>Eliminar</button>
              </div>
            </article>
          ))}

          {banners.length === 0 && (
            <div className="empty-card">
              <h3>No hay banners cargados.</h3>
            </div>
          )}
        </div>
        <PaginationControls />
      </>
      )}
    </>
  )
}
