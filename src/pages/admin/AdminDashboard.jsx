import { useEffect, useState } from 'react'
import { getAdminSummary } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { getAccessToken } = useAuth()
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSummary() {
      try {
        const token = await getAccessToken()
        const data = await getAdminSummary(token)
        setSummary(data)
      } catch (err) {
        setError(err.message)
      }
    }

    loadSummary()
  }, [getAccessToken])

  if (error) return <div className="empty-card"><h3>No pudimos cargar el panel admin</h3><p>{error}</p></div>
  if (!summary) return <div className="empty-card"><h3>Cargando panel...</h3></div>

  return (
    <>
      <p className="eyebrow">Resumen</p>
      <h1>Panel de control</h1>

      <div className="stats-grid">
        <div>
          <span>Productos</span>
          <strong>{summary.productsCount || 0}</strong>
        </div>
        <div>
          <span>Órdenes</span>
          <strong>{summary.ordersCount || 0}</strong>
        </div>
        <div>
          <span>Usuarios</span>
          <strong>{summary.usersCount || 0}</strong>
        </div>
      </div>
    </>
  )
}