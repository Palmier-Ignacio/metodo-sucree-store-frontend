import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAdminOrders, getAdminProducts, getAdminSummary } from '../services/api'
import { money, formatOrderStatus } from '../utils/formatters'

export default function Admin() {
  const { getAccessToken } = useAuth()
  const [summary, setSummary] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true)
        setError('')
        const [summaryData, productsData, ordersData] = await Promise.all([
          getAdminSummary(getAccessToken),
          getAdminProducts(getAccessToken),
          getAdminOrders(getAccessToken),
        ])

        setSummary(summaryData.summary || summaryData)
        setProducts(productsData.products || productsData || [])
        setOrders(ordersData.orders || ordersData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [getAccessToken])

  return (
    <section className="page section">
      <div className="container admin">
        <p className="eyebrow">Panel admin</p>
        <h1>Control de ventas y accesos</h1>

        {loading && <div className="empty-card"><h3>Cargando panel...</h3></div>}
        {error && <div className="empty-card"><h3>No pudimos cargar el panel admin</h3><p>{error}</p></div>}

        {!loading && !error && (
          <>
            <div className="admin-grid">
              <article className="admin-card"><span>Ventas aprobadas</span><strong>{summary?.approved_orders ?? 0}</strong></article>
              <article className="admin-card"><span>Productos activos</span><strong>{summary?.active_products ?? products.length}</strong></article>
              <article className="admin-card"><span>Ingresos</span><strong>{money(summary?.revenue ?? 0)}</strong></article>
            </div>

            <div className="admin-table">
              <h2>Productos</h2>
              {products.length === 0 ? <p>No hay productos cargados todavía.</p> : (
                <table>
                  <thead><tr><th>Título</th><th>Tipo</th><th>Estado</th><th>Precio</th></tr></thead>
                  <tbody>{products.map((product) => <tr key={product.id}><td>{product.title}</td><td>{product.type}</td><td>{product.status}</td><td>{money(product.price)}</td></tr>)}</tbody>
                </table>
              )}
            </div>

            <div className="admin-table">
              <h2>Órdenes</h2>
              {orders.length === 0 ? <p>No hay órdenes registradas todavía.</p> : (
                <table>
                  <thead><tr><th>ID</th><th>Fecha</th><th>Estado</th><th>Total</th><th>Comprador</th></tr></thead>
                  <tbody>{orders.map((order) => <tr key={order.id}><td>{order.id}</td><td>{order.created_at || order.date}</td><td>{formatOrderStatus(order.status)}</td><td>{money(order.total)}</td><td>{order.user_email || order.customer_email || '-'}</td></tr>)}</tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
