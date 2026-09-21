import { supabase } from './supabase'

export type EventType =
  | 'menu_view'
  | 'category_view'
  | 'item_view'
  | 'search'
  | 'whatsapp_click'
  | 'call_click'
  | 'order_started'
  | 'order_completed'

// Random per-visit id. No personal data is collected.
function sessionId(): string | null {
  try {
    let id = sessionStorage.getItem('menu_sid')
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
      sessionStorage.setItem('menu_sid', id)
    }
    return id
  } catch {
    return null
  }
}

// Fire and forget: analytics must never break the menu.
export function trackEvent(
  restaurantId: string,
  eventType: EventType,
  opts: { menuItemId?: string; metadata?: Record<string, unknown> } = {},
): void {
  void supabase
    .from('analytics_events')
    .insert({
      restaurant_id: restaurantId,
      event_type: eventType,
      menu_item_id: opts.menuItemId ?? null,
      session_id: sessionId(),
      metadata: opts.metadata ?? {},
    })
    .then(
      () => undefined,
      () => undefined,
    )
}
