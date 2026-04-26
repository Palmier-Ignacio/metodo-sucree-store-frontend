import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminProducts, updateAdminProduct } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money, productType, discountedPrice } from '../../utils/formatters'

export default function AdminProducts() {
  const { getAccessToken } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProducts() {
    try {
      setLoading(true)
      const token = await getAccessToken()
      const data = await getAdminProducts(token)
      setProducts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function toggleProduct(product) {
    try {
      const token = await getAccessToken()

      await updateAdminProduct(product.id, {
        ...product,
        is_active: !product.is_active,
        status: product.is_active ? 'inactive' : 'published',
      }, token)

      await loadProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1>Productos</h1>
        </div>

        <Link className="button" to="/admin/productos/nuevo">
          Nuevo producto
        </Link>
      </div>

      {loading && <div className="empty-card"><h3>Cargando productos...</h3></div>}
      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      {!loading && !error && (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{productType(product.type)}</td>
                  <td>
                    <div className="admin-price-cell">
                      {Number(product.discount_percent) > 0 && <small>{product.discount_percent}%OFF</small>}
                      <p><span className={Number(product.discount_percent) > 0 && "has-discount"}>{money(product.price)}</span> {Number(product.discount_percent) > 0 && <strong>{money(discountedPrice(product.price, product.discount_percent))}</strong>}</p>

                    </div>
                  </td>
                  <td>{product.status || 'draft'}</td>
                  <td>{product.is_active ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <Link to={`/admin/productos/${product.id}/editar`}>Editar</Link>
                      <button onClick={() => toggleProduct(product)}>
                        {product.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}