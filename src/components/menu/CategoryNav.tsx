import { useEffect, useRef } from 'react'
import type { Category } from '../../types/database'

interface Props {
  categories: Category[]
  activeId: string | null // null = "All"
  accent: string
  onSelect: (id: string | null) => void
}

export default function CategoryNav({ categories, activeId, accent, onSelect }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  // Keep the highlighted chip visible as the customer scrolls the menu.
  useEffect(() => {
    const key = activeId ?? 'all'
    const chip = listRef.current?.querySelector<HTMLElement>(`[data-chip="${key}"]`)
    chip?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activeId])

  const chipClass = (active: boolean) =>
    'shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    (active ? 'border-transparent text-white' : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100')

  return (
    <nav aria-label="Menu categories">
      <div ref={listRef} className="flex gap-2 overflow-x-auto px-5 pb-3 [scrollbar-width:none]">
        <button
          type="button"
          data-chip="all"
          aria-current={activeId === null ? 'true' : undefined}
          onClick={() => onSelect(null)}
          className={chipClass(activeId === null)}
          style={activeId === null ? { backgroundColor: accent } : undefined}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            data-chip={c.id}
            aria-current={activeId === c.id ? 'true' : undefined}
            onClick={() => onSelect(c.id)}
            className={chipClass(activeId === c.id)}
            style={activeId === c.id ? { backgroundColor: accent } : undefined}
          >
            {c.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
