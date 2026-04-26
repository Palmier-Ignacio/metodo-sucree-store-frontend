import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error cargando perfil:', error.message)
      setProfile(null)
      return null
    }

    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!mounted) return

        setUser(data.session?.user ?? null)
      } catch (error) {
        console.error('Error inicializando sesión:', error.message)
        if (!mounted) return
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // No hacemos queries a Supabase dentro de este callback.
      // Evita estados colgados al refrescar o cerrar sesión.
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
      setLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      return
    }

    let cancelled = false

    async function syncProfile() {
      const result = await loadProfile(user.id)
      if (cancelled && result) return
    }

    syncProfile()

    return () => {
      cancelled = true
    }
  }, [user?.id, loadProfile])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    setUser(data.user ?? null)

    return data
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error

    return data
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)

    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error cerrando sesión:', error.message)

    setUser(null)
    setProfile(null)
    setLoading(false)
  }, [])

  const getAccessToken = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    return data.session?.access_token ?? null
  }, [])

  const isAdmin = profile?.role === 'admin'

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      getAccessToken,
    }),
    [user, profile, loading, isAdmin, signIn, signUp, signOut, getAccessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
