import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/logo-sin-fondo.png'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    setMenuOpen(false)
    navigate('/', { replace: true })
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__brand" onClick={closeMenu}>
        <img src={logo} alt="Método Sucrée" />
      </Link>

      <button
        className="navbar__toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen}
        type="button"
      >
        {menuOpen ? '×' : '☰'}
      </button>

      <nav className={`navbar__links ${menuOpen ? 'is-open' : ''}`}>
        <NavLink to="/tienda" onClick={closeMenu}>Tienda</NavLink>
        {user && <NavLink to="/biblioteca" onClick={closeMenu}>Mi biblioteca</NavLink>}
        {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin</NavLink>}
      </nav>

      <div className={`navbar__actions ${menuOpen ? 'is-open' : ''}`}>
        <Link className="cart-pill" to="/checkout" onClick={closeMenu}>
          Carrito <strong>{items.length}</strong>
        </Link>

        {user ? (
          <button
            className="button button--small button--ghost"
            onClick={handleSignOut}
            type="button"
          >
            Salir
          </button>
        ) : (
          <Link className="button button--small" to="/login" onClick={closeMenu}>
            Ingresar
          </Link>
        )}
      </div>
    </header>
  )
}