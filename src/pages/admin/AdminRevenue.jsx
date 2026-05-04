import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminRevenue } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { money, shortDate, formatOrderStatus } from '../../utils/formatters'

const today = new Date().toISOString().slice(0, 10)

function getDefaultFrom() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  return date.toISOString().slice(0, 10)
}


export default function AdminRevenue() {
  const { getAccessToken } = useAuth()
  const [filters, setFilters] = useState({
    period: 'month',
    from: '',
    to: '',
    groupBy: 'day',
    status: 'paid',
  })
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')



  async function loadRevenue(nextFilters = filters) {
    try {
      setLoading(true)
      setError('')
      const token = await getAccessToken()
      const data = await getAdminRevenue(nextFilters, token)
      setRevenue(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRevenue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAccessToken])

  function handleChange(event) {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'period' ? { from: '', to: '' } : {}),
    }))
  }

  function applyQuickRange(period) {
    const nextFilters = { ...filters, period, from: '', to: '' }
    setFilters(nextFilters)
    loadRevenue(nextFilters)
  }

  function handleSubmit(event) {
    event.preventDefault()
    loadRevenue(filters)
  }

  const maxRevenue = useMemo(() => {
    const values = revenue?.timeline?.map((item) => Number(item.revenue || 0)) || []
    return Math.max(...values, 1)
  }, [revenue])

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Análisis</p>
          <h1>Ingresos</h1>
        </div>
      </div>

      <div className="revenue-quick-actions">
        <button
          className={`button button--small ${filters.period === 'week' ? '' : 'button--outline'}`}
          onClick={() => applyQuickRange('week')}
          type="button"
        >
          Esta semana
        </button>

        <button
          className={`button button--small ${filters.period === 'month' ? '' : 'button--outline'}`}
          onClick={() => applyQuickRange('month')}
          type="button"
        >
          Este mes
        </button>

        <button
          className={`button button--small ${filters.period === 'year' ? '' : 'button--outline'}`}
          onClick={() => applyQuickRange('year')}
          type="button"
        >
          Este año
        </button>
      </div>

      <form className="revenue-filters" onSubmit={handleSubmit}>
        <label>
          Desde
          <input name="from" type="date" value={filters.from} max={filters.to || today} onChange={handleChange} placeholder={getDefaultFrom()} />
        </label>
        <label>
          Hasta
          <input name="to" type="date" value={filters.to} min={filters.from || undefined} max={today} onChange={handleChange} />
        </label>
        <label>
          Agrupar por
          <select name="groupBy" value={filters.groupBy} onChange={handleChange}>
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </label>
        <label>
          Estado
          <select name="status" value={filters.status} onChange={handleChange}>
            <option value="paid">Solo pagadas/aprobadas</option>
            <option value="all">Todas las órdenes</option>
          </select>
        </label>
        <button className="button" type="submit">Filtrar ingresos</button>
      </form>

      {loading && <div className="empty-card"><h3>Calculando ingresos...</h3></div>}
      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      {!loading && !error && revenue && (
        <>
          <div className="stats-grid revenue-stats">
            <div><span>Total generado</span><strong>{money(revenue.totalRevenue || 0)}</strong></div>
            <div><span>Órdenes incluidas</span><strong>{revenue.paidOrdersCount || 0}</strong></div>
            <div><span>Ticket promedio</span><strong>{money(revenue.averageOrderValue || 0)}</strong></div>
          </div>

          <div className="revenue-chart admin-table">
            <div className="admin-box-header">
              <h2>Evolución</h2>
              <span>
                del {revenue.filters?.from ? shortDate(revenue.filters.from) : '-'} al {revenue.filters?.to ? shortDate(revenue.filters.to) : '-'}
              </span>
            </div>

            {(revenue.timeline || []).length === 0 ? (
              <p>No hay ingresos para el rango seleccionado.</p>
            ) : (
              <div className="revenue-bars">
                {revenue.timeline.map((item) => (
                  <div className="revenue-bar-row" key={item.period}>
                    <span>{shortDate(item.period)}</span>
                    <div><i style={{ width: `${(Number(item.revenue || 0) / maxRevenue) * 100}%` }} /></div>
                    <strong>{money(item.revenue || 0)}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-table admin-responsive-table">
  <h2>Ingresos por producto</h2>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th>Tipo</th>
        <th>Ventas</th>
        <th>Ingresos</th>
      </tr>
    </thead>
    <tbody>
      {(revenue.products || []).map((product) => (
        <tr key={product.productId}>
          <td>{product.title}</td>
          <td>{product.type}</td>
          <td>{product.salesCount}</td>
          <td>{money(product.revenue || 0)}</td>
        </tr>
      ))}
      {(revenue.products || []).length === 0 && (
        <tr>
          <td colSpan="4">Sin productos vendidos en este rango.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

<div className="admin-mobile-list">
  {(revenue.products || []).map((product) => (
    <article className="admin-mobile-card" key={product.productId}>
      <h3>{product.title}</h3>

      <div className="admin-mobile-row">
        <span>Tipo</span>
        <strong>{product.type}</strong>
      </div>

      <div className="admin-mobile-row">
        <span>Ventas</span>
        <strong>{product.salesCount}</strong>
      </div>

      <div className="admin-mobile-row">
        <span>Ingresos</span>
        <strong>{money(product.revenue || 0)}</strong>
      </div>
    </article>
  ))}

  {(revenue.products || []).length === 0 && (
    <div className="empty-card">
      <h3>Sin productos vendidos en este rango.</h3>
    </div>
  )}
</div>

<div className="admin-table admin-responsive-table">
  <h2>Órdenes del período</h2>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Estado</th>
        <th>Total</th>
        <th>Usuario</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {(revenue.orders || []).map((order) => (
        <tr key={order.id}>
          <td>{shortDate(order.created_at)}</td>
          <td>{formatOrderStatus(order.status)}</td>
          <td>{money(order.total || 0)}</td>
          <td>{order.user?.label || 'Sin usuario'}</td>
          <td>
            <div className="admin-actions">
              <Link to={`/admin/ordenes/${order.id}`}>Ver orden</Link>
              <Link to={`/admin/usuarios/${order.user_id}`}>Ver usuario</Link>
            </div>
          </td>
        </tr>
      ))}
      {(revenue.orders || []).length === 0 && (
        <tr>
          <td colSpan="5">No hay órdenes para este filtro.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>

<div className="admin-mobile-list">
  {(revenue.orders || []).map((order) => (
    <article className="admin-mobile-card" key={order.id}>
      <h3>{money(order.total || 0)}</h3>

      <div className="admin-mobile-row">
        <span>Fecha</span>
        <strong>{shortDate(order.created_at)}</strong>
      </div>

      <div className="admin-mobile-row">
        <span>Estado</span>
        <strong>{formatOrderStatus(order.status)}</strong>
      </div>

      <div className="admin-mobile-row">
        <span>Usuario</span>
        <strong>{order.user?.label || 'Sin usuario'}</strong>
      </div>

      <div className="admin-mobile-actions">
        <Link className="button button--small button--outline" to={`/admin/ordenes/${order.id}`}>
          Ver orden
        </Link>
        <Link className="button button--small button--outline" to={`/admin/usuarios/${order.user_id}`}>
          Ver usuario
        </Link>
      </div>
    </article>
  ))}

  {(revenue.orders || []).length === 0 && (
    <div className="empty-card">
      <h3>No hay órdenes para este filtro.</h3>
    </div>
  )}
</div>
        </>
      )}
    </>
  )
}
