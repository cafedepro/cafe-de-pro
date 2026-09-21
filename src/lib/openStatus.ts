export type OpenStatus = 'open' | 'closed' | 'unknown'

function toMinutes(t: string): number {
  const [h, m] = t.split(':')
  return Number(h) * 60 + Number(m)
}

// Uses the RESTAURANT's timezone, never the visitor's.
export function getOpenStatus(
  timezone: string,
  opening: string | null,
  closing: string | null,
  now: Date = new Date(),
): OpenStatus {
  if (!opening || !closing) return 'unknown'

  let nowMin: number
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
    const h = Number(parts.find((p) => p.type === 'hour')?.value)
    const m = Number(parts.find((p) => p.type === 'minute')?.value)
    if (Number.isNaN(h) || Number.isNaN(m)) return 'unknown'
    nowMin = h * 60 + m
  } catch {
    return 'unknown'
  }

  const o = toMinutes(opening)
  const c = toMinutes(closing)
  if (o === c) return 'open' // same time = open 24 hours
  const isOpen = o < c ? nowMin >= o && nowMin < c : nowMin >= o || nowMin < c // second case: past midnight
  return isOpen ? 'open' : 'closed'
}

export function formatTime(t: string | null): string {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}
