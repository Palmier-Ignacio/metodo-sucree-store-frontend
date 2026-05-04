import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createPreference } from '../services/api'
import { money, discountedPrice } from '../utils/formatters'

export default function Checkout() {
  const { items, total, removeItem, refreshCart, refreshingCart } = useCart()
  const { user, getAccessToken } = useAuth()
  const [error, setError] = useState('')
  const [loadingPayment, setLoadingPayment] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    refreshCart()
  }, [])

 async function pay() {
  if (!user) {
    nav('/login', { state: { from: { pathname: '/checkout' } } })
    return
  }

  try {
    setLoadingPayment(true)
    setError('')

    const freshItems = await refreshCart()

    if (!freshItems.length) {
      setError('No hay productos disponibles para pagar. Revisá tu carrito.')
      return
    }

    const preference = await createPreference(freshItems, getAccessToken)

    window.location.href = preference.init_point
  } catch (err) {
    setError(err.message)
  } finally {
    setLoadingPayment(false)
  }
}

  return (
    <section className="page section">
      <div className="container checkout-grid">
        <div>
          <p className="eyebrow">Checkout</p>
          <h1>Confirmá tu compra</h1>
          <p>* Al aprobarse el pago, se asignarán los productos a tu biblioteca.</p>

          {items.length === 0 ? (
            <div className="empty-card"><h3>Tu carrito está vacío</h3><Link className="button" to="/tienda">Ir a la tienda</Link></div>
          ) : (
            <div className="cart-list">
              {items.map((item) => (
                <article key={item.id}>
                  <div><h3>{item.title}</h3>{item.subtitle && <p>{item.subtitle}</p>}</div>
                  <div className='cart-product-data'>
                    <div className='price-box'>
                      {Number(item.discount_percent) > 0 && (
                        <span className="old-price">{money(item.price)}</span>
                      )}

                      <strong>
                        {money(discountedPrice(item.price, item.discount_percent))}
                      </strong>

                      {Number(item.discount_percent) > 0 && (
                        <small>{item.discount_percent}% OFF</small>
                      )}
                    </div>
                    <button onClick={() => removeItem(item.id)}>Quitar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside className="summary-card">
          <h3>Resumen</h3>
          <div><span>Productos</span><strong>{items.length}</strong></div>
          <div><span>Total</span><strong>{money(total)}</strong></div>
          {error && <span className="form-error">{error}</span>}
          <button className="button" disabled={!items.length || loadingPayment || refreshingCart} onClick={pay}>{loadingPayment ? 'Iniciando pago...' : refreshingCart ? 'Actualizando carrito...' : 'Pagar con Mercado Pago'}</button>
          {/* <small>El pago se inicia desde el backend para proteger Mercado Pago, órdenes y asignación de accesos.</small> */}
        </aside>
      </div>
    </section>
  )
}
