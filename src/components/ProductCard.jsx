import { Link } from 'react-router-dom'
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa'
import { useCart } from '../context/CartContext'
import { money, productType, discountedPrice } from '../utils/formatters'

export default function ProductCard({ product }) {
  const { addItem, items } = useCart()
  const inCart = items.some((item) => item.id === product.id)
  const unavailable = product.status && product.status !== 'published'

  return (
    <article className="product-card">
      <div className="product-card__cover">
        {product.cover_url ? <img src={product.cover_url} alt={product.title} /> : product.type === 'course' ? <FaGraduationCap /> : <FaBookOpen />}
        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{productType(product.type)}</p>
        <h3>{product.title}</h3>
        {product.subtitle && <strong className="product-card__subtitle">{product.subtitle}</strong>}
        <p>{product.description}</p>
        <div className="product-card__footer">
          <div className="price-box">
            {Number(product.discount_percent) > 0 && (
              <span className="old-price">{money(product.price)}</span>
            )}

            <span className="price">
              {product.price ? money(discountedPrice(product.price, product.discount_percent)) : 'Próximamente'}
            </span>

            {Number(product.discount_percent) > 0 && (
              <small className='discount_percent'>{product.discount_percent}% OFF</small>
            )}
          </div>
          <div className="product-card__actions">
            <Link className="button button--outline button--small" to={`/producto/${product.id}`}>Ver</Link>
            <button className="button button--small" disabled={unavailable || inCart} onClick={() => addItem(product)}>{inCart ? 'Agregado' : 'Comprar'}</button>
          </div>
        </div>
      </div>
    </article>
  )
}
