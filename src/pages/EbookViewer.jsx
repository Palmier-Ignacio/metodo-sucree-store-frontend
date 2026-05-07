import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { createDownloadUrl } from '../services/api'


export default function EbookViewer() {
  const { productId } = useParams()

  const { user, loading: loadingAuth, getAccessToken } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ebookUrl, setEbookUrl] = useState('')
  const [ebookTitle, setEbookTitle] = useState('')

  useEffect(() => {
    if (loadingAuth) return

    if (!user) return

    let cancelled = false

    async function loadEbook() {
      try {
        setLoading(true)
        setError('')

        const token = await getAccessToken()

        if (!token) {
          throw new Error('No hay sesión activa.')
        }

        const data = await createDownloadUrl(productId, token)

        if (cancelled) return

        if (!data?.url) {
          throw new Error('No se pudo abrir el ebook.')
        }

        setEbookUrl(data.url)
        setEbookTitle(data.title || 'Ebook')
      } catch (err) {
        console.error(err)

        if (cancelled) return

        setError(err.message || 'No se pudo abrir el ebook.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadEbook()

    return () => {
      cancelled = true
    }
  }, [productId, user, loadingAuth, getAccessToken])

  if (!loadingAuth && !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <section className="page section">
      <div className="container">
        {loading && (
          <div className="empty-card">
            <h2>Cargando ebook...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="empty-card">
            <h2>No se pudo abrir el ebook</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && ebookUrl && (
          <div className="ebook-viewer">
            <div className="ebook-viewer__overlay"><p className='ebook-viewer__overlay-title'>{ebookTitle}</p></div>
            <iframe
              src={ebookUrl}
              title="Ebook"
              className="ebook-viewer__iframe"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  )
}