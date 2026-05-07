import { useEffect, useState } from 'react'
import { FaDownload, FaLockOpen, FaQuestionCircle   } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { createDownloadUrl, getMyLibrary } from '../services/api'
import { money, formatOrderStatus } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, profile, loading: loadingAuth, getAccessToken } = useAuth()

  const [library, setLibrary] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (loadingAuth) return

    if (!user) {
      setLibrary([])
      setOrders([])
      setLoadingLibrary(false)
      return
    }

    let cancelled = false

    async function loadLibrary() {
      try {
        setLoadingLibrary(true)
        setError('')

        const token = await getAccessToken()

        if (!token) {
          throw new Error('No hay sesión activa. Volvé a iniciar sesión.')
        }

        const data = await getMyLibrary(token)

        if (cancelled) return

        setLibrary(data.products || data.library || [])
        setOrders(data.orders || [])
      } catch (err) {
        if (cancelled) return
        console.error('Error cargando biblioteca:', err)
        setError(err.message || 'Error cargando biblioteca')
        setLibrary([])
        setOrders([])
      } finally {
        if (!cancelled) setLoadingLibrary(false)
      }
    }

    loadLibrary()

    return () => {
      cancelled = true
    }
  }, [user?.id, loadingAuth, getAccessToken])

  // async function downloadProduct(productId) {
  //   try {
  //     setDownloadingId(productId)
  //     setError('')

  //     const token = await getAccessToken()

  //     if (!token) {
  //       throw new Error('No hay sesión activa. Volvé a iniciar sesión.')
  //     }

  //     const data = await createDownloadUrl(productId, token)

  //     if (!data?.url) {
  //       throw new Error('No se pudo generar el link de descarga.')
  //     }

  //     window.location.href = data.url
  //   } catch (err) {
  //     console.error('Error generando descarga:', err)
  //     setError(err.message || 'Error generando descarga')
  //   } finally {
  //     setDownloadingId(null)
  //   }
  // }

  function openProduct(productId) {
  navigate(`/biblioteca/${productId}`)
}

  const isLoading = loadingAuth || loadingLibrary

  return (
    <section className="page section">
      <div className="container dashboard-grid">
        <aside className="account-card">
          <p className="eyebrow">Mi cuenta</p>
          <h2>{profile?.full_name || user?.user_metadata?.full_name || 'Usuario Sucrée'}</h2>
          <p>{user?.email}</p>
          <span title='Son los productos a los que podes acceder actualmente'>
            <FaLockOpen /> Productos activos: {library.length}  <FaQuestionCircle  />
          </span>
        </aside>

        <div>
          <p className="eyebrow">Biblioteca personal</p>
          <h1>Mis Ebooks</h1>

          {isLoading && (
            <div className="empty-card">
              <h3>Cargando biblioteca...</h3>
            </div>
          )}

          {!isLoading && error && (
            <div className="empty-card">
              <h3>No pudimos cargar tu biblioteca</h3>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && library.length === 0 && (
            <div className="empty-card">
              <h3>Todavía no tenés productos</h3>
              <p>Cuando una compra sea aprobada, tus productos van a aparecer acá.</p>
            </div>
          )}

          {!isLoading && !error && library.length > 0 && (
            <div className="library-list">
              {library.map((product) => (
                <article key={product.id}>
                  <div>
                    <h3>{product.title}</h3>
                    {product.subtitle && <p>{product.subtitle}</p>}
                    {product.description && <p>{product.description}</p>}
                  </div>

                  <button
                    className="button button--small"
                    disabled={downloadingId === product.id}
                    onClick={() => openProduct(product.id)}
                  >
                    Ver Ebook
                  </button>
                </article>
              ))}
            </div>
          )}

          {/* <h2 className="orders-title">Compras</h2>

          {!isLoading && orders.length === 0 && (
            <div className="empty-card">
              <p>No hay compras registradas todavía.</p>
            </div>
          )}

          {!isLoading && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.id}>
                  <span>{new Date(order.created_at).toLocaleDateString('es-AR')}</span>
                  <strong>{formatOrderStatus(order.status)}</strong>
                  <b>{money(order.total)}</b>
                </article>
              ))}
            </div>
          )} */}
        </div>
      </div>
    </section>
  )
}
