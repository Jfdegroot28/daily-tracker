import { createClient } from '@supabase/supabase-js'

const env = (import.meta as any).env ?? {}

const supabaseUrl = env.VITE_SUPABASE_URL as string
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function sGet(userId: string, k: string): Promise<unknown> {
  try {
    const { data, error } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', `${userId}:${k}`)
      .maybeSingle()
    if (error) throw error
    return data ? JSON.parse(data.value) : null
  } catch {
    return null
  }
}

export async function sSet(userId: string, k: string, v: unknown): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kv_store')
      .upsert({ key: `${userId}:${k}`, value: JSON.stringify(v) }, { onConflict: 'key' })
    if (error) throw error
    return true
  } catch {
    return false
  }
}
