import type { Category } from '@/lib/types'
import { createClient } from './client'

/**
 * Fetch all categories available to the current user.
 * Returns system categories (is_system=true) + user-created categories.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('categories')
    .select('id, user_id, name, name_th, icon, color, type, is_system, created_at')
    .or(`is_system.eq.true,user_id.eq.${user.id}`)
    .order('is_system', { ascending: false })
    .order('name')

  if (error) throw error
  return (data ?? []) as Category[]
}
