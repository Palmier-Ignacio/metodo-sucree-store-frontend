import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../services/api'

export default function Catalog() {
  const [filter, setFilter] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError('')
        const data = await getProducts()
        setProducts(data.products || data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((product) => product.type === filter)
  }, [filter, products])

  return (
    <section className="page section">
      <div className="container">
        <p className="eyebrow">Catálogo</p>
        <div className="section-title">
          <h1>Biblioteca Sucrée</h1>
          {/* <p>Ebooks disponibles hoy y estructura preparada para cursos mañana.</p> */}
        </div>

        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Todo</button>
          <button className={filter === 'ebook' ? 'active' : ''} onClick={() => setFilter('ebook')}>Ebooks</button>
          <button className={filter === 'course' ? 'active' : ''} onClick={() => setFilter('course')}>Cursos</button>
        </div>

        {loading && <div className="empty-card"><h3>Cargando productos...</h3></div>}
        {error && <div className="empty-card"><h3>No pudimos cargar el catálogo</h3><p>{error}</p></div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="empty-card">
            <h3>No hay {filter === "ebook" ? "ebooks" : filter === "course" ? "cursos" : "productos"} disponibles</h3>
            {/* <p>Cuando el backend publique productos activos, van a aparecer acá.</p> */}
            </div>
        )}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  )
}
