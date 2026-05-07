import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { syncCheckoutOrder } from '../services/api'

const PAID_STATUSES = ['approved', 'paid', 'completed', 'success', 'accredited']

export default function Success() {
  const [params] = useSearchParams()
  const orderId = params.get('order_id')
  const { getAccessToken } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState('')

  const isPaid = useMemo(() => {
    return PAID_STATUSES.includes(order?.status)
  }, [order])

  useEffect(() => {
    if (!orderId) {
      setError('No encontramos la orden.')
      setLoading(false)
      return
    }

    let cancelled = false
    let intervalId = null

    async function sync() {
      try {
        setError('')

        const token = await getAccessToken()
        const data = await syncCheckoutOrder(orderId, token)

        if (cancelled) return

        const nextOrder = data.order || data
        setOrder(nextOrder)
        setAttempts((prev) => prev + 1)
        setLoading(false)

        if (PAID_STATUSES.includes(nextOrder.status)) {
          clearInterval(intervalId)
        }
      } catch (err) {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      }
    }

    sync()
    intervalId = setInterval(sync, 5000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [orderId, getAccessToken])

  if (loading) {
    return (
      <section className="page section success">
        <div className="container">
          <div className="success-card">
            <h1>Estamos confirmando tu pago</h1>
            <p>Esto puede tardar unos segundos.</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page section success">
        <div className="container">
          <div className="success-card">
            <h1>No pudimos confirmar la orden</h1>
            <p>{error}</p>
            <Link className="button" to="/checkout">Volver al checkout</Link>
          </div>
        </div>
      </section>
    )
  }

  if (isPaid) {
    return (
      <section className="page section success">
        <div className="container">
          <div className="success-card">
            <p className="eyebrow">Pago aprobado</p>
            <h1>¡Compra confirmada!</h1>
            <p>Para acceder al Ebook debés ingresar a "Mi biblioteca"</p>
            <Link className="button" to="/biblioteca">Ir a mi biblioteca</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page section success">
      <div className="container">
        <div className="success-card">
          <p className="eyebrow">Pago en proceso</p>
          <h1>Estamos confirmando tu pago</h1>
          <p>
            Mercado Pago todavía figura como <b>{order?.status || 'pendiente'}</b>.
            Cuando se apruebe, tus productos se asignarán automáticamente.
          </p>
          <p>Intentos de verificación: {attempts}</p>
          <Link className="button button--outline" to="/biblioteca">
            Revisar mi biblioteca
          </Link>
        </div>
      </div>
    </section>
  )
}      