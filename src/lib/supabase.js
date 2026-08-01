import { createClient } from '@supabase/supabase-js'

// Read from Vite env. If they're missing (e.g. local dev without a .env, or the
// offline standalone build) the client is null and all analytics/admin calls
// simply no-op instead of throwing — the public site keeps working regardless.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = Boolean(supabase)
