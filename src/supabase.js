import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://moefihwqvhdzvqjqmoja.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Submits a new customer order to Supabase
 * @param {Object} orderData
 */
export async function submitOrder(orderData) {
  if (!supabase) {
    console.warn('[Supabase] VITE_SUPABASE_ANON_KEY is not set. Order will be recorded locally only.')
    return { success: true, localOnly: true }
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()

    if (error) {
      console.error('[Supabase] Insert error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err) {
    console.error('[Supabase] Exception:', err)
    return { success: false, error: err.message }
  }
}
