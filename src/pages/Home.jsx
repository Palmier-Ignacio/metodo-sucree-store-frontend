import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-isotipo.png'
import ProductCard from '../components/ProductCard'
import { getFeaturedProducts } from '../services/api'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const data = await getFeaturedProducts()
        setFeaturedProducts(data.products || data || [])
      } catch {
        setFeaturedProducts([])
      }
    }

    loadFeaturedProducts()
  }, [])

  return (
    <>
      <section className="hero-store">
        <div className="container hero-store__grid">
          <div>
            <p className="eyebrow">Biblioteca digital</p>
            <h1>Comprá, aprendé y volvé a descargar tus ebooks cuando quieras</h1>
            <p>Una store pensada como plataforma: usuarios, compras asociadas, biblioteca personal y base escalable para futuros cursos.</p>
            <div className="hero__actions">
              <Link className="button" to="/catalogo">Ver ebooks</Link>
              <Link className="button button--outline" to="/biblioteca">Mi biblioteca</Link>
            </div>
          </div>
          <img src={logo} alt="Método Sucrée" />
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="eyebrow">Productos destacados</p>
            <div className="section-title">
              <h2>Recetas para producir y vender</h2>
              <p>Todos los productos quedan vinculados a tu cuenta.</p>
            </div>
            <div className="products-grid">
              {featuredProducts.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section section--light">
        <div className="container stats-grid">
          <div><strong>01</strong><h3>Login y cuenta</h3><p>Registro, acceso y compras conectadas al usuario.</p></div>
          <div><strong>02</strong><h3>Biblioteca</h3><p>Descarga de PDFs desde el perfil, incluso después de comprar.</p></div>
          <div><strong>03</strong><h3>Admin</h3><p>Control de productos, órdenes y accesos asignados desde backend.</p></div>
        </div>
      </section>
    </>
  )
}
