import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminProducts, updateAdminProduct } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money, productType, discountedPrice, formatProductStatus } from '../../utils/formatters'

export default function AdminProducts() {
  const { getAccessToken } = useAuth()
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProducts(nextPage = pagination.page) {
    try {
      setLoading(true)
      const token = await getAccessToken()
      const data = await getAdminProducts(token, { page: nextPage, pageSize: 20 })
      setProducts(data.products || data.items || data.data || data || [])
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

      await loadProducts(pagination.page)
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
          onClick={() => loadProducts(pagination.page - 1)}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages} · {pagination.total} productos</span>
        <button
          className="button button--small button--outline"
          disabled={pagination.page >= pagination.totalPages || loading}
          onClick={() => loadProducts(pagination.page + 1)}
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
        <>
          <PaginationControls />

          <div className="admin-table admin-responsive-table">
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
                        {Number(product.discount_percent) > 0 && (
                          <small>{product.discount_percent}% OFF</small>
                        )}

                        <p>
                          <span className={Number(product.discount_percent) > 0 ? 'has-discount' : ''}>
                            {money(product.price)}
                          </span>

                          {Number(product.discount_percent) > 0 && (
                            <strong> {money(discountedPrice(product.price, product.discount_percent))}</strong>
                          )}
                        </p>
                      </div>
                    </td>
                    <td>{formatProductStatus(product.status) || 'draft'}</td>
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

                {products.length === 0 && (
                  <tr>
                    <td colSpan="6">No hay productos cargados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-mobile-list">
            {products.map((product) => (
              <article className="admin-mobile-card" key={product.id}>
                <h3>{product.title}</h3>

                <div className="admin-mobile-row">
                  <span>Tipo</span>
                  <strong>{productType(product.type)}</strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Precio</span>
                  <strong>
                    {Number(product.discount_percent) > 0
                      ? `${money(discountedPrice(product.price, product.discount_percent))} (${product.discount_percent}% OFF)`
                      : money(product.price)}
                  </strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Estado</span>
                  <strong>{formatProductStatus(product.status) || 'draft'}</strong>
                </div>

                <div className="admin-mobile-row">
                  <span>Activo</span>
                  <strong>{product.is_active ? 'Sí' : 'No'}</strong>
                </div>

                <div className="admin-mobile-actions">
                  <Link className="button button--small button--outline" to={`/admin/productos/${product.id}/editar`}>
                    Editar
                  </Link>

                  <button className="button button--small" onClick={() => toggleProduct(product)}>
                    {product.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </article>
            ))}

            {products.length === 0 && (
              <div className="empty-card">
                <h3>No hay productos cargados.</h3>
              </div>
            )}
          </div>

          <PaginationControls />
        </>
      )}
    </>
  )
}