import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Error con datos de sesión por parte de la web. Si el error persiste, póngase en contacto con nosotros.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
