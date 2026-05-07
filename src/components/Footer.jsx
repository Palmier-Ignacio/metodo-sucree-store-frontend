import { Link } from "react-router-dom"
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">

        <div>
          <strong>Método Sucrée Store</strong>
          <p>
            Biblioteca digital para emprendedoras en pastelería.
            Recursos prácticos para aprender, organizar y vender mejor.
          </p>
        </div>

        <div>
          <strong>Navegación</strong>
          <nav className="footer-links">
            <a href="/tienda">Tienda</a>
            <a href="/biblioteca">Mi biblioteca</a>
            <a href="/login">Ingresar</a>
          </nav>
        </div>

        <div>
          <strong>Contacto</strong>
          <div className="footer-links">
            <span>metodosucree@gmail.com</span>
            <span>@metodosucree</span>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Método Sucrée</span>
        <p>Desarrollado por <Link className="link-portfolio" to="https://palmier-ignacio.github.io/">Palmier Ignacio </Link></p>
      </div>
    </footer>
  )
}