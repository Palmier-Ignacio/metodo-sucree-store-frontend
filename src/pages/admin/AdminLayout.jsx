import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <section className="page section">
      <div className="container admin-layout">
        <aside className="admin-sidebar">
          <p className="eyebrow">Panel admin</p>
          <h2>Sucrée</h2>

          <nav>
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/productos">Productos</NavLink>
            <NavLink to="/admin/usuarios">Usuarios</NavLink>
            <NavLink to="/admin/ordenes">Órdenes</NavLink>
          </nav>
        </aside>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </section>
  )
}