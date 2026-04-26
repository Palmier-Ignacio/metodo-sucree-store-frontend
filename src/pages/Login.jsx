import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        await signIn(form.email, form.password)
        nav(loc.state?.from?.pathname || '/biblioteca')
        return
      }

      const data = await signUp(form.email, form.password, form.name)
      if (!data.session) {
        setMessage('Te enviamos un email de confirmación. Revisá tu casilla para activar la cuenta antes de ingresar.')
        setMode('login')
        return
      }

      nav(loc.state?.from?.pathname || '/biblioteca')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Cuenta Sucrée</p>
        <h1>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
        <p>Usá tu cuenta para ver compras, descargar PDFs y acceder a futuros cursos.</p>
        {mode === 'register' && <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>}
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <span className="form-error">{error}</span>}
        {message && <span className="form-success">{message}</span>}
        <button className="button" type="submit">{mode === 'login' ? 'Ingresar' : 'Registrarme'}</button>
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Crear una cuenta nueva' : 'Ya tengo cuenta'}</button>
        <Link to="/" className="link-button">Volver a la tienda</Link>
      </form>
    </section>
  )
}
