import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { shortDate, formatUserRole  } from '../../utils/formatters'

function UsersTable({ title, users }) {
  return (
    <div className="admin-users-box">
      <div className="admin-box-header">
        <h2>{title}</h2>
        <span>{users.length}</span>
      </div>

      <div className="admin-table admin-responsive-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name || 'Sin nombre'}</td>
                <td>{user.email || '-'}</td>
                <td>
                  <span className={`role-pill role-pill--${user.role}`}>
                    {formatUserRole(user.role)}
                  </span>
                </td>
                <td>{shortDate(user.created_at)}</td>
                <td>
                  <Link className="button button--small button--outline" to={`/admin/usuarios/${user.id}`}>
                    Ver usuario
                  </Link>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="5">No hay usuarios en esta categoría en esta página.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-list">
        {users.map((user) => (
          <article className="admin-mobile-card" key={user.id}>
            <h3>{user.full_name || 'Sin nombre'}</h3>

            <div className="admin-mobile-row">
              <span>Email</span>
              <strong>{user.email || '-'}</strong>
            </div>

            <div className="admin-mobile-row">
              <span>Rol</span>
              <strong>{formatUserRole(user.role)}</strong>
            </div>

            <div className="admin-mobile-row">
              <span>Creado</span>
              <strong>{shortDate(user.created_at)}</strong>
            </div>

            <div className="admin-mobile-actions">
              <Link className="button button--small button--outline" to={`/admin/usuarios/${user.id}`}>
                Ver usuario
              </Link>
            </div>
          </article>
        ))}

        {users.length === 0 && (
          <div className="empty-card">
            <h3>No hay usuarios en esta categoría en esta página.</h3>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { getAccessToken } = useAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadUsers(nextPage = pagination.page) {
    try {
      setLoading(true)
      setError('')
      const token = await getAccessToken()
      const data = await getAdminUsers(token, { page: nextPage, pageSize: 20 })
      setUsers(data.users || data.items || data.data || data || [])
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
    loadUsers(1)
  }, [getAccessToken])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users

    return users.filter((user) => {
      const name = user.full_name?.toLowerCase() || ''
      const email = user.email?.toLowerCase() || ''
      return name.includes(term) || email.includes(term)
    })
  }, [users, search])

  const admins = filteredUsers.filter((user) => user.role === 'admin')
  const customers = filteredUsers.filter((user) => user.role !== 'admin')

  function PaginationControls() {
    if (pagination.totalPages <= 1) return null

    return (
      <div className="admin-actions admin-toolbar">
        <button
          className="button button--small button--outline"
          disabled={pagination.page <= 1 || loading}
          onClick={() => loadUsers(pagination.page - 1)}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages} · {pagination.total} usuarios</span>
        <button
          className="button button--small button--outline"
          disabled={pagination.page >= pagination.totalPages || loading}
          onClick={() => loadUsers(pagination.page + 1)}
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
          <h1>Usuarios</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Buscar por nombre o email en esta página..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <div className="empty-card"><h3>Cargando usuarios...</h3></div>}
      {error && <div className="empty-card"><h3>Error</h3><p>{error}</p></div>}

      {!loading && !error && (
        <>
          <PaginationControls />
          <div className="admin-users-grid">
            <UsersTable title="Administradores" users={admins} />
            <UsersTable title="Clientes" users={customers} />
          </div>
          <PaginationControls />
        </>
      )}
    </>
  )
}
