import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { getProductById } from '../services/api'
import { money, productType, discountedPrice } from '../utils/formatters'

export default function Product() {
  const { id } = useParams()
  const { addItem, items, ownedProductIds } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        setError('')
        const data = await getProductById(id)
        setProduct(data.product || data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  if (loading) {
    return <section className="page section"><div className="container empty-card"><h1>Cargando producto...</h1></div></section>
  }

  if (error || !product) {
    return <section className="page section"><div className="container empty-card"><h1>Producto no encontrado</h1><p>{error}</p><Link className="button" to="/tienda">Volver a la tienda</Link></div></section>
  }

  const unavailable = product.status && product.status !== 'published'
  const inCart = items.some((item) => item.id === product.id)
  const alreadyOwned = ownedProductIds.has(product.id)

  return (
    <section className="page section">
      <div className="container">
        <div className="product-detail">
          <div className="product-detail__cover">
            {product.cover_url ? (
              <img src={product.cover_url} alt={product.title} />
            ) : product.type === 'course' ? (
              <FaGraduationCap />
            ) : (
              <FaBookOpen />
            )}
          </div>

          <div className="product-detail__content">
            {product.badge && (
              <span className="product-badge">{product.badge}</span>
            )}

            <p className="eyebrow">{productType(product.type)}</p>
            <h1>{product.title}</h1>

            {product.subtitle && (
              <h3 className="product-detail__subtitle">{product.subtitle}</h3>
            )}

            <p>{product.description}</p>

            <ul className="check-list">
              <li>Acceso asociado a tu cuenta.</li>
              <li>Miralo desde Mi biblioteca.</li>
              <li>Compra segura utilizando Mercado Pago.</li>
              {product.type === 'course' && (
                <li>Preparado para módulos, videos y materiales.</li>
              )}
            </ul>

            <div className="detail-buy-box">
              <div className="price-box price-box--detail">
                <div className="price-row">
                  {Number(product.discount_percent) > 0 && (
                    <span className="old-price">{money(product.price)}</span>
                  )}

                  <strong className="price">
                    {product.price
                      ? money(discountedPrice(product.price, product.discount_percent))
                      : 'Próximamente'}
                  </strong>
                </div>

                {Number(product.discount_percent) > 0 && (
                  <small>{product.discount_percent}% OFF</small>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className="button"
                  disabled={unavailable || inCart || alreadyOwned}
                  onClick={() => addItem(product)}
                >
                  {alreadyOwned ? 'Ya lo tenés en tu biblioteca' : inCart ? 'Ya está en el carrito' : 'Agregar al carrito'}
                </button>

                <Link className="button button--outline" to="/checkout">
                  Ir al carrito
                </Link>
              </div>
            </div>
          </div>
        </div>

        {product.long_description && (
          <div className="product-long-section">
            <div className="product-long-section__content">
              <h2>Detalle del producto</h2>

              {product.long_description.split('\n').map((p, i) =>
                p.trim() ? <p key={i}>{p}</p> : null
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}