import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { checkEmailExists } from '../services/api'

function getFriendlyError(message = '') {
  const normalized = message.toLowerCase()

  if (normalized.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }

  if (normalized.includes('user already registered')) {
    return 'Ya existe una cuenta con este email.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Debés confirmar tu email antes de ingresar.'
  }

  if (normalized.includes('network')) {
    return 'Error de conexión. Intentá nuevamente.'
  }
  console.log(normalized);

  return 'Ocurrió un error inesperado.'
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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
      if (form.password !== form.confirmPassword) {
        setError('Las contraseñas no coinciden.')
        return
      }
      const emailCheck = await checkEmailExists(form.email)

      if (emailCheck.exists) {
        setError('Ya existe una cuenta con este email.')
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
      setError(getFriendlyError(err.message))
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Cuenta Sucrée</p>
        <h1>{mode === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
        <p>Usá tu cuenta para hacer compras y acceder a tus productos.</p>
        {mode === 'register' && <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>}
        <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {mode === 'register' && (
          <label>
            Confirmar contraseña
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
          </label>
        )}
        {error && <span className="form-error">{error}</span>}
        {message && <span className="form-success">{message}</span>}
        <button className="button" type="submit">{mode === 'login' ? 'Ingresar' : 'Registrarme'}</button>
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Crear una cuenta nueva' : 'Ya tengo cuenta'}</button>
        <Link to="/" className="link-button">Volver a la tienda</Link>
      </form>
    </section>
  )
}
