import { useEffect, useState } from 'react'
import { getAdminOrders } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../utils/formatters'

export default function AdminOrders() {
  const { getAccessToken } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      try {
        const token = await getAccessToken()
        const data = await getAdminOrders(token)
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [getAccessToken])

  return (
    <>
      <p className="eyebrow">Gestión</p>
      <h1>Órdenes</h1>

      {loading && <div className="empty-card"><h3>Cargando órdenes...</h3></div>}
      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      {!loading && !error && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Productos</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.created_at}</td>
                  <td>{order.user_id}</td>
                  <td>{order.status}</td>
                  <td>{money(order.total)}</td>
                  <td>
                    {(order.items || [])
                      .map((item) => item.product?.title)
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan="5">No hay órdenes registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}