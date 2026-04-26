import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo-sin-fondo.png'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand"><img src={logo} alt="Método Sucrée" /></Link>
      <nav className="navbar__links">
        <NavLink to="/catalogo">Catálogo</NavLink>
        {user && <NavLink to="/biblioteca">Mi biblioteca</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="navbar__actions">
        <Link className="cart-pill" to="/checkout">Carrito <strong>{items.length}</strong></Link>
        {user ? (
          <button className="button button--small button--ghost" onClick={handleSignOut}>Salir</button>
        ) : (
          <Link className="button button--small" to="/login">Ingresar</Link>
        )}
      </div>
    </header>
  )
}
