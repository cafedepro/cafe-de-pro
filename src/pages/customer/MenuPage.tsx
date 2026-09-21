import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import MenuHeader from '../../components/menu/MenuHeader'
import CategoryNav from '../../components/menu/CategoryNav'
import MenuItemCard from '../../components/menu/MenuItemCard'
import ItemSheet from '../../components/menu/ItemSheet'
import { usePublicMenu } from '../../hooks/usePublicMenu'
import { getOpenStatus } from '../../lib/openStatus'
import { trackEvent } from '../../lib/analytics'
import type { MenuItem } from '../../types/database'
import type { PublicMenu } from '../../types/menu'

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' }

export default function MenuPage() {
  const { restaurantSlug } = useParams()
  const state = usePublicMenu(restaurantSlug)

  if (state.status === 'loading') {
    return (
      <main className="grid min-h-full place-items-center p-6 text-stone-600" aria-busy="true">
        Loading menu…
      </main>
    )
  }
  if (state.status === 'notfound') {
    return (
      <main className="grid min-h-full place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold" style={serif}>
            Menu not found
          </h1>
          <p className="mt-2 text-stone-600">Please check the QR code or link and try again.</p>
        </div>
      </main>
    )
  }
  if (state.status === 'error') {
    return (
      <main className="grid min-h-full place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold" style={serif}>
            Something went wrong
          </h1>
          <p className="mt-2 text-stone-600">{state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 font-medium text-white"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }
  return <MenuView data={state.data} />
}

function MenuView({ data }: { data: PublicMenu }) {
  const { restaurant, settings, categories, items, variants, addOns } = data
  const [searchParams] = useSearchParams()
  const table = searchParams.get('table')

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MenuItem | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())
  const viewTracked = useRef(false)

  const status = getOpenStatus(restaurant.timezone, restaurant.opening_time, restaurant.closing_time, now)

  // Refresh Open/Closed once a minute.
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  // Page title + one menu_view event per visit.
  useEffect(() => {
    document.title = `${restaurant.name} · Menu`
    if (!viewTracked.current) {
      viewTracked.current = true
      trackEvent(restaurant.id, 'menu_view', { metadata: table ? { table } : {} })
    }
  }, [restaurant.id, restaurant.name, table])

  // Log searches after the customer stops typing.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) return
    const id = window.setTimeout(() => trackEvent(restaurant.id, 'search', { metadata: { query: q.toLowerCase() } }), 900)
    return () => window.clearTimeout(id)
  }, [query, restaurant.id])

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase()
    return categories
      .map((category) => {
        let list = items.filter((i) => i.category_id === category.id)
        if (!settings.show_unavailable_items) list = list.filter((i) => i.is_available)
        if (q) list = list.filter((i) => `${i.name} ${i.description ?? ''} ${category.name}`.toLowerCase().includes(q))
        return { category, items: list }
      })
      .filter((s) => s.items.length > 0)
  }, [categories, items, query, settings.show_unavailable_items])

  // Highlight the category currently under the sticky bar.
  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(`cat-${s.category.id}`))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id.replace('cat-', ''))
        }
      },
      { rootMargin: '-140px 0px -65% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    const onScroll = () => {
      if (window.scrollY < 200) setActiveId(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [sections])

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'

  const selectCategory = (id: string | null) => {
    setActiveId(id)
    if (id === null) {
      window.scrollTo({ top: 0, behavior })
      return
    }
    trackEvent(restaurant.id, 'category_view')
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior, block: 'start' })
  }

  const openItem = (item: MenuItem) => {
    setSelected(item)
    trackEvent(restaurant.id, 'item_view', { menuItemId: item.id })
  }

  const themeVars = {
    '--menu-accent': settings.accent_color,
    backgroundColor: settings.secondary_color,
    fontFamily: `"${settings.font_family}", ui-sans-serif, system-ui, sans-serif`,
  } as React.CSSProperties

  return (
    <div className="min-h-full text-stone-900" style={themeVars}>
      <MenuHeader
        restaurant={restaurant}
        settings={settings}
        status={status}
        table={table}
        onCall={() => trackEvent(restaurant.id, 'call_click')}
        onWhatsApp={() => trackEvent(restaurant.id, 'whatsapp_click')}
      />

      <div className="sticky top-0 z-20 border-b border-stone-200/70 pt-3 backdrop-blur" style={{ backgroundColor: `${settings.secondary_color}f2` }}>
        <div className="mx-auto max-w-2xl">
          <div className="px-5 pb-3">
            <div className="relative">
              <Search size={18} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                inputMode="search"
                aria-label="Search the menu"
                placeholder="Search dishes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-full border border-stone-300 bg-white py-3 pl-11 pr-11 text-base outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full hover:bg-stone-100"
                >
                  <X size={16} aria-hidden />
                </button>
              )}
            </div>
          </div>
          <CategoryNav
            categories={sections.map((s) => s.category)}
            activeId={activeId}
            accent={settings.primary_color}
            onSelect={selectCategory}
          />
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-5 pb-24 pt-6">
        {sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
            <Search size={28} aria-hidden className="mx-auto text-stone-400" />
            {query.trim() ? (
              <>
                <p className="mt-3 text-lg font-semibold" style={serif}>
                  Nothing matches “{query.trim()}”
                </p>
                <p className="mt-1 text-stone-600">Try a different word, like “chicken” or “tea”.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 font-medium text-white"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="mt-3 text-lg font-semibold" style={serif}>
                The menu is being prepared. Please check back soon.
              </p>
            )}
          </div>
        ) : (
          sections.map(({ category, items: list }) => (
            <section key={category.id} id={`cat-${category.id}`} aria-labelledby={`cat-title-${category.id}`} className="scroll-mt-40 pb-8">
              <h2 id={`cat-title-${category.id}`} className="text-2xl font-bold" style={serif}>
                {category.name}
              </h2>
              {category.description && <p className="mt-1 text-stone-600">{category.description}</p>}
              <ul className="mt-4 space-y-3">
                {list.map((item) => (
                  <MenuItemCard key={item.id} item={item} currency={restaurant.currency} settings={settings} onOpen={openItem} />
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      {selected && (
        <ItemSheet
          item={selected}
          variants={variants.filter((v) => v.menu_item_id === selected.id)}
          addOns={addOns.filter((a) => a.menu_item_id === selected.id)}
          currency={restaurant.currency}
          settings={settings}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
