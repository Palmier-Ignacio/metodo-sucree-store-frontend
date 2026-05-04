import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminOrderById } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money, shortDate, productType, formatOrderStatus } from '../../utils/formatters'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const { getAccessToken } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        setError('')
        const token = await getAccessToken()
        const data = await getAdminOrderById(id, token)
        setOrder(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [getAccessToken, id])

  if (loading) {
    return <div className="empty-card"><h3>Cargando orden...</h3></div>
  }

  if (error || !order) {
    return (
      <div className="empty-card">
        <h3>No pudimos cargar la orden</h3>
        {error && <p>{error}</p>}
        <Link className="button" to="/admin/ordenes">Volver a órdenes</Link>
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Detalle de orden</p>
          <h1>Orden</h1>
        </div>

        <Link className="button button--outline" to="/admin/ordenes">
          Volver
        </Link>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <span>Fecha</span>
          <strong>{shortDate(order.created_at)}</strong>
        </div>

        <div className="admin-card">
          <span>Estado</span>
          <strong>{formatOrderStatus(order.status)}</strong>
        </div>

        <div className="admin-card">
          <span>Total</span>
          <strong>{money(order.total || 0)}</strong>
        </div>
      </div>

      <div className="admin-table">
        <div className="admin-box-header">
          <h2>Cliente</h2>
          <Link className="button button--small button--outline" to={`/admin/usuarios/${order.user_id}`}>
            Ver usuario
          </Link>
        </div>

        <div className="admin-mobile-row">
          <span>Usuario</span>
          <strong>{order.user?.label || order.user_id}</strong>
        </div>

        <div className="admin-mobile-row">
          <span>ID usuario</span>
          <strong>{order.user_id}</strong>
        </div>

        <div className="admin-mobile-row">
          <span>Mercado Pago</span>
          <strong>{order.mercadopago_id || '-'}</strong>
        </div>
      </div>

      <div className="admin-table admin-responsive-table">
        <h2>Productos comprados</h2>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Precio pagado</th>
            </tr>
          </thead>

          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td>{item.product?.title || 'Producto sin nombre'}</td>
                <td>{productType(item.product?.type)}</td>
                <td>{money(item.price || 0)}</td>
              </tr>
            ))}

            {(order.items || []).length === 0 && (
              <tr>
                <td colSpan="3">Esta orden no tiene productos asociados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-list">
        {(order.items || []).map((item) => (
          <article className="admin-mobile-card" key={item.id}>
            <h3>{item.product?.title || 'Producto sin nombre'}</h3>

            <div className="admin-mobile-row">
              <span>Tipo</span>
              <strong>{productType(item.product?.type)}</strong>
            </div>

            <div className="admin-mobile-row">
              <span>Precio pagado</span>
              <strong>{money(item.price || 0)}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
