import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminUsers } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { shortDate } from '../../utils/formatters'

function UsersTable({ title, users }) {
  return (
    <div className="admin-users-box">
      <div className="admin-box-header">
        <h2>{title}</h2>
        <span>{users.length}</span>
      </div>

      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Creado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name || 'Sin nombre'}</td>
                <td>{user.email || '-'}</td>
                <td>
                  <span className={`role-pill role-pill--${user.role}`}>
                    {user.role}
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
                <td colSpan="5">No hay usuarios en esta categoría.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const { getAccessToken } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const token = await getAccessToken()
        const data = await getAdminUsers(token)
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
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
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="empty-card">
          <h3>Cargando usuarios...</h3>
        </div>
      )}

      {error && (
        <div className="empty-card">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-users-grid">
          <UsersTable title="Administradores" users={admins} />
          <UsersTable title="Clientes" users={customers} />
        </div>
      )}
    </>
  )
}