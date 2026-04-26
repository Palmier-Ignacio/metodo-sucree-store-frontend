import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { getProductById } from '../services/api'
import { money, productType, discountedPrice } from '../utils/formatters'

export default function Product() {
  const { id } = useParams()
  const { addItem } = useCart()
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
    return <section className="page section"><div className="container empty-card"><h1>Producto no encontrado</h1><p>{error}</p><Link className="button" to="/catalogo">Volver al catálogo</Link></div></section>
  }

  const unavailable = product.status && product.status !== 'published'

  return (
    <section className="page section">
      <div className="container">

        {/* BLOQUE SUPERIOR (RESUMEN) */}
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

          <div>
            {product.badge && (
              <span className="product-badge">
                {product.badge}
              </span>
            )}

            <p className="eyebrow">{productType(product.type)}</p>
            <h1>{product.title}</h1>

            {product.subtitle && (
              <h3 className="product-detail__subtitle">
                {product.subtitle}
              </h3>
            )}

            <p>{product.description}</p>

            <ul className="check-list">
              <li>Acceso asociado a tu cuenta.</li>
              <li>Descarga desde Mi biblioteca.</li>
              <li>Compra segura utilizando Mercado Pago.</li>
              {product.type === 'course' && (
                <li>Preparado para módulos, videos y materiales.</li>
              )}
            </ul>

            <div className="detail-actions">
              <div className="price-box price-box--detail">
                {Number(product.discount_percent) > 0 && (
                  <span className="old-price">{money(product.price)}</span>
                )}

                <strong className="price">
                  {product.price ? money(discountedPrice(product.price, product.discount_percent)) : 'Próximamente'}
                </strong>

                {Number(product.discount_percent) > 0 && (
                  <small>{product.discount_percent}% OFF</small>
                )}
              </div>

              <button
                className="button"
                disabled={unavailable}
                onClick={() => addItem(product)}
              >
                Agregar al carrito
              </button>

              <Link className="button button--outline" to="/checkout">
                Ir al carrito
              </Link>
            </div>
          </div>
        </div>

        {/* BLOQUE INFERIOR (DETALLE LARGO) */}
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
