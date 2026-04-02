'use client'

import {
  clearReadNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/supabase/notifications'
import type { Notification } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)

  const unreadCount = notifications.filter(n => !n.is_read).length

  // ── Load ───────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Mark single read (optimistic) ─────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    try { await markNotificationRead(id) } catch { /* revert would complicate UX */ }
  }, [])

  // ── Mark all read (optimistic) ─────────────────────────────
  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    try { await markAllNotificationsRead() } catch { /* noop */ }
  }, [])

  // ── Clear read notifications ───────────────────────────────
  const clearRead = useCallback(async () => {
    setNotifications(prev => prev.filter(n => !n.is_read))
    try { await clearReadNotifications() } catch { /* noop */ }
  }, [])

  // ── Add local notification (push without DB round-trip) ───
  // Used by hooks that trigger notifications after mutations
  const pushLocal = useCallback((n: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>) => {
    const local: Notification = {
      ...n,
      id:         `local-${Date.now()}`,
      user_id:    '',
      is_read:    false,
      created_at: new Date().toISOString(),
    }
    setNotifications(prev => [local, ...prev])
  }, [])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllRead,
    clearRead,
    pushLocal,
    refetch: load,
  }
}
