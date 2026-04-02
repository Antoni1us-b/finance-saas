import type { Notification, NotificationType } from '@/lib/types'
import { createClient } from './client'

// ── READ ──────────────────────────────────────────────────────
export async function getNotifications(limit = 30): Promise<Notification[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Notification[]
}

// ── MARK SINGLE AS READ ───────────────────────────────────────
export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

// ── MARK ALL AS READ ──────────────────────────────────────────
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
  if (error) throw error
}

// ── CREATE ────────────────────────────────────────────────────
export interface NotificationInput {
  type: NotificationType
  title: string
  message: string
  link?: string
}

export async function createNotification(input: NotificationInput): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Fire-and-forget — silently ignore errors so UI is never blocked
  await supabase.from('notifications').insert({
    user_id:  user.id,
    type:     input.type,
    title:    input.title,
    message:  input.message,
    link:     input.link ?? null,
    is_read:  false,
  })
}

// ── DELETE (clear all read) ───────────────────────────────────
export async function clearReadNotifications(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .eq('is_read', true)
}
