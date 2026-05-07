import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo-isotipo.png'
import ProductCard from '../components/ProductCard'
import { getActiveBanner, getFeaturedProducts, sendContactMessage } from '../services/api'
import { FaArrowRight, FaInstagram, FaTiktok} from "react-icons/fa";
import { MdEmail } from "react-icons/md";


const initialContactForm = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [activeBanner, setActiveBanner] = useState(null)
  const [contactForm, setContactForm] = useState(initialContactForm)
  const [contactLoading, setContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState('')

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const data = await getFeaturedProducts()
        setFeaturedProducts(data.products || data || [])
      } catch {
        setFeaturedProducts([])
      }
    }

    async function loadActiveBanner() {
      try {
        const data = await getActiveBanner()
        setActiveBanner(data.banner || data || null)
      } catch {
        setActiveBanner(null)
      }
    }

    loadFeaturedProducts()
    loadActiveBanner()
  }, [])

  function handleContactChange(event) {
    const { name, value } = event.target
    setContactSuccess("")

    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleContactSubmit(event) {
    event.preventDefault()

    try {

      const cleanedForm = {
        firstName: contactForm.firstName.trim(),
        lastName: contactForm.lastName.trim(),
        email: contactForm.email.trim(),
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
      }

      if (
        !cleanedForm.firstName ||
        !cleanedForm.lastName ||
        !cleanedForm.email ||
        !cleanedForm.subject ||
        !cleanedForm.message
      ) {
        setContactError('Todos los campos son obligatorios.')
        return
      }
      setContactLoading(true)
      setContactError('')
      setContactSuccess('')

      await sendContactMessage(cleanedForm)
      setContactForm(initialContactForm)
      setContactSuccess('Tu mensaje fue enviado correctamente. Será respondido dentro de las siguientes 48hs hábiles.')
    } catch (err) {
      setContactError(err.message)
    } finally {
      setContactLoading(false)
    }
  }

  return (
    <>
      <section className="hero-store">
        <div className="container hero-store__grid">
          <div>
            <p className="eyebrow">Ebooks de pastelería</p>
            <h1>Aprendé recetas, técnicas y estrategias para emprender con pastelería</h1>
            <p>
              Guías digitales pensadas para ayudarte a producir mejor, organizar tus recetas
              y vender con más seguridad desde tu emprendimiento.
            </p>

            <div className="hero__actions">
              <Link className="button" to="/tienda">Ver ebooks</Link>
              <Link className="button button--outline" to="/biblioteca">Mi biblioteca</Link>
            </div>
          </div>

          <img src={logo} alt="Método Sucrée" />
        </div>
      </section>

      {activeBanner?.image_url && (
        <section className="section home-banner-section">
          <div className="container">
            {activeBanner.link_url ? (
              <a className="home-banner" href={activeBanner.link_url} target="_blank" rel="noreferrer">
                <img src={activeBanner.image_url} alt={activeBanner.alt_text || activeBanner.title || 'Banner'} />
              </a>
            ) : (
              <div className="home-banner">
                <img src={activeBanner.image_url} alt={activeBanner.alt_text || activeBanner.title || 'Banner'} />
              </div>
            )}
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container">
            <p className="eyebrow">Productos destacados</p>

            <div className="section-title">
              <h2>Recursos para vender más y trabajar mejor</h2>
              <p>
                Material en PDF para aplicar en tu cocina, mejorar tus procesos
                y potenciar tu emprendimiento pastelero.
              </p>
            </div>

            <div className="products-grid">
              {featuredProducts.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div >
            <div className='btn--send-tienda'>
              <Link className='button button--outline' to="/tienda">Ver todos los Ebooks <FaArrowRight /> </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section section--light">
        <div className="container stats-grid">
          <div>
            <strong>01</strong>
            <h3>Aprendizaje práctico</h3>
            <p>Contenido claro, directo y pensado para aplicar en productos reales.</p>
          </div>

          <div>
            <strong>02</strong>
            <h3>Visualizacion en página</h3>
            <p>Accedé a tus ebooks comprados desde tu biblioteca personal.</p>
          </div>

          <div>
            <strong>03</strong>
            <h3>Para emprender</h3>
            <p>Recetas, organización y herramientas para vender con más confianza.</p>
          </div>
        </div>
      </section>

      <section className="section contact-section">
        <div className="container contact-grid">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2>Escribinos</h2>
            <p>
              Dejanos tu consulta y te responderemos al correo que indiques en el formulario.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
          
            <div className="contact-form__row">
              <label>
                Nombre
                <input name="firstName" value={contactForm.firstName} onChange={handleContactChange} required />
              </label>

              <label>
                Apellido
                <input name="lastName" value={contactForm.lastName} onChange={handleContactChange} required />
              </label>
            </div>

            <label>
              Correo electrónico
              <input name="email" type="email" value={contactForm.email} onChange={handleContactChange} required />
            </label>

            <label>
              Asunto
              <input name="subject" value={contactForm.subject} onChange={handleContactChange} required />
            </label>

            <label>
              Mensaje
              <textarea name="message" rows="6" value={contactForm.message} onChange={handleContactChange} required />
            </label>
            {contactError && <p className="form-error">{contactError}</p>}
            {contactSuccess && <p className="form-success">{contactSuccess}</p>}

            <button className="button" disabled={contactLoading}>
              {contactLoading ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="container contact-info-grid">

          <div>
            <p className="eyebrow">Información</p>
            <h2>Datos de contacto</h2>
            <p>
              También podés comunicarte con nosotros por otros medios.
            </p>
          </div>

          <div className="contact-info-cards">

            <div className="contact-card">
              <strong><MdEmail/> Email</strong>
              <p>metodosucree@gmail.com</p>
            </div>

            <div className="contact-card">
              <strong><FaInstagram/> Instagram</strong>
              <p>@metodosucree</p>
            </div>

            <div className="contact-card">
              <strong><FaTiktok/> Tiktok</strong>
              <p>@metodosucree</p>
            </div>

          </div>

        </div>
      </section>
    </>
  )
}
