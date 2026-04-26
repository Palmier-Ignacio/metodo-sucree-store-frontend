import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getAdminProducts,
  getAdminUserById,
  grantAdminUserProduct,
  revokeAdminUserProduct,
  updateAdminUser,
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money } from '../../utils/formatters'

export default function AdminUserDetail() {
  const { id } = useParams()
  const { getAccessToken } = useAuth()

  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      setLoading(true)

      const token = await getAccessToken()

      const [userData, productsData] = await Promise.all([
        getAdminUserById(id, token),
        getAdminProducts(token),
      ])

      setUser(userData)
      setProducts(productsData)
      setRole(userData.role || 'customer')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  async function saveRole() {
    try {
      const token = await getAccessToken()
      await updateAdminUser(id, { role }, token)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function grantProduct() {
    if (!selectedProduct) return

    try {
      const token = await getAccessToken()
      await grantAdminUserProduct(id, selectedProduct, token)
      setSelectedProduct('')
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  async function revokeProduct(productId) {
    try {
      const token = await getAccessToken()
      await revokeAdminUserProduct(id, productId, token)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="empty-card"><h3>Cargando usuario...</h3></div>
  if (error) return <div className="empty-card"><h3>Error</h3><p>{error}</p></div>
  if (!user) return null

  const ownedProducts = user.products || user.library || []
  const orders = user.orders || []

  return (
    <>
      <p className="eyebrow">Usuario</p>
      <h1>{user.full_name || 'Usuario sin nombre'}</h1>

      <div className="admin-card">
        <p><b>Email:</b> {user.email || '-'}</p>
        <p><b>ID:</b> {user.id}</p>

        <div className="admin-inline-form">
          <label>
            Rol
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button className="button button--small" onClick={saveRole}>
            Guardar rol
          </button>
        </div>
      </div>

      <h2 className="orders-title">Productos del usuario</h2>

      <div className="admin-inline-form">
        <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
          <option value="">Seleccionar producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </select>

        <button className="button button--small" onClick={grantProduct}>
          Asignar producto
        </button>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {ownedProducts.map((item) => {
              const product = item.product || item

              return (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.type}</td>
                  <td>
                    <button onClick={() => revokeProduct(product.id)}>
                      Quitar acceso
                    </button>
                  </td>
                </tr>
              )
            })}

            {ownedProducts.length === 0 && (
              <tr>
                <td colSpan="3">Este usuario no tiene productos asignados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="orders-title">Órdenes</h2>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.created_at}</td>
                <td>{order.status}</td>
                <td>{money(order.total)}</td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="3">Este usuario no tiene órdenes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}