import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOrders } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money, shortDate, formatOrderStatus } from '../../utils/formatters'

const orderStatusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'approved,paid,completed,success,accredited', label: 'Pagadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'rejected,failure', label: 'Rechazadas' },
]

export default function AdminOrders() {
  const { getAccessToken } = useAuth()
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadOrders(nextPage = pagination.page, nextStatus = status) {
    try {
      setLoading(true)
      setError('')
      const token = await getAccessToken()
      const data = await getAdminOrders(token, {
        page: nextPage,
        pageSize: 20,
        status: nextStatus,
      })

      setOrders(data.orders || data.items || data.data || data || [])
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
    loadOrders(1, status)
  }, [getAccessToken, status])

  function handleStatusChange(event) {
    setStatus(event.target.value)
  }

  function PaginationControls() {
    if (pagination.totalPages <= 1) return null

    return (
      <div className="admin-actions admin-toolbar">
        <button
          className="button button--small button--outline"
          disabled={pagination.page <= 1 || loading}
          onClick={() => loadOrders(pagination.page - 1, status)}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages} · {pagination.total} órdenes</span>
        <button
          className="button button--small button--outline"
          disabled={pagination.page >= pagination.totalPages || loading}
          onClick={() => loadOrders(pagination.page + 1, status)}
        >
          Siguiente
        </button>
      </div>
    )
  }

  return (
    <>
      <p className="eyebrow">Gestión</p>
      <h1>Órdenes</h1>

      <div className="admin-inline-form">
        <label>
          Filtrar por estado
          <select value={status} onChange={handleStatusChange}>
            {orderStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {loading && <div className="empty-card"><h3>Cargando órdenes...</h3></div>}
      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      {!loading && !error && (
        <>
          <PaginationControls />

          <div className="admin-table admin-responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Productos</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{shortDate(order.created_at)}</td>
                    <td>{order.user?.label || 'Sin usuario'}</td>
                    <td>{formatOrderStatus(order.status)}</td>
                    <td>{money(order.total)}</td>
                    <td>
                      {(order.items || [])
                        .map((item) => item.product?.title)
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link to={`/admin/ordenes/${order.id}`}>Ver orden</Link>
                        <Link to={`/admin/usuarios/${order.user_id}`}>Ver usuario</Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay órdenes registradas para este filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-mobile-list">
            {orders.map((order) => (
              <article className="admin-mobile-card" key={order.id}>
                <h3>{money(order.total)}</h3>

                <div className="admin-mobile-row">
                  <span>Fecha</span>
                  <strong>{shortDate(order.created_at)}</strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Usuario</span>
                  <strong>{order.user?.label || 'Sin usuario'}</strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Estado</span>
                  <strong>{formatOrderStatus(order.status)}</strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Productos</span>
                  <strong>
                    {(order.items || [])
                      .map((item) => item.product?.title)
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </strong>
                </div>

                <div className="admin-mobile-actions">
                  <Link className="button button--small button--outline" to={`/admin/ordenes/${order.id}`}>
                    Ver orden
                  </Link>
                  <Link className="button button--small button--outline" to={`/admin/usuarios/${order.user_id}`}>
                    Ver usuario
                  </Link>
                </div>
              </article>
            ))}

            {orders.length === 0 && (
              <div className="empty-card">
                <h3>No hay órdenes registradas para este filtro.</h3>
              </div>
            )}
          </div>

          <PaginationControls />
        </>
      )}
    </>
  )
}
