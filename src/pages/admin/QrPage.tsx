import { useCallback, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Printer, Trash2 } from 'lucide-react'
import { Button, Field, FormError } from '../../components/admin/ui'
import { useRestaurant } from '../../context/RestaurantContext'
import { createTables, deleteTable, listTables, type RestaurantTable } from '../../services/tables'
import { downloadPng, downloadSvg, findSvg, isLocalAddress, menuUrl } from '../../lib/qr'
import type { Restaurant } from '../../types/database'

const serif = { fontFamily: 'Georgia, "Times New Roman", serif' }

export default function QrPage() {
  const { restaurant } = useRestaurant()
  if (!restaurant) return null
  return <QrContent restaurant={restaurant} />
}

function QrContent({ restaurant }: { restaurant: Restaurant }) {
  const [baseUrl, setBaseUrl] = useState(window.location.origin)
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [count, setCount] = useState('10')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [printing, setPrinting] = useState<'main' | 'tables' | null>(null)

  const mainUrl = menuUrl(baseUrl, restaurant.slug)
  const local = isLocalAddress(baseUrl)

  const load = useCallback(async () => {
    try {
      setTables(await listTables(restaurant.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tables.')
    }
  }, [restaurant.id])

  useEffect(() => {
    void load()
  }, [load])

  // Print only the cards, then go back to normal.
  useEffect(() => {
    const done = () => setPrinting(null)
    window.addEventListener('afterprint', done)
    return () => window.removeEventListener('afterprint', done)
  }, [])

  const print = (what: 'main' | 'tables') => {
    setPrinting(what)
    window.setTimeout(() => window.print(), 100)
  }

  const run = async (action: () => Promise<void>) => {
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    }
  }

  const copyLink = () =>
    run(async () => {
      await navigator.clipboard.writeText(mainUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    })

  const download = (id: string, name: string, kind: 'png' | 'svg') =>
    run(async () => {
      const svg = findSvg(id)
      if (!svg) throw new Error('QR code not ready yet.')
      if (kind === 'svg') downloadSvg(svg, `${name}.svg`)
      else await downloadPng(svg, `${name}.png`)
    })

  const addTables = () =>
    run(async () => {
      const n = Number(count)
      if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Enter a number of tables between 1 and 100.')
      await createTables(restaurant.id, n)
      await load()
    })

  const removeTable = (t: RestaurantTable) => {
    if (window.confirm(`Delete Table ${t.table_number}? Its printed QR code will still open your menu.`)) {
      void run(async () => {
        await deleteTable(t.id)
        await load()
      })
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">QR codes</h1>
        <p className="mt-1 text-stone-600">Print these and place them on tables, the counter, or the door.</p>
      </div>

      <FormError>{error}</FormError>

      <section className="space-y-3 rounded-xl border border-stone-200 bg-white p-5">
        <Field
          label="Website address used inside the QR code"
          hint="After you put your app online, open this page from that address and it fills in automatically."
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        {local && (
          <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This address only works on your own computer, so phones cannot open it. Put your app online first, or paste your
            real website address above before printing.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="text-lg font-medium">Main menu QR code</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div id="qr-main" className="rounded-xl border border-stone-200 bg-white p-3">
            <QRCodeSVG value={mainUrl} size={176} level="M" marginSize={1} />
          </div>
          <div className="min-w-0 space-y-3">
            <p className="break-all text-sm text-stone-600">{mainUrl}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => void download('qr-main', `${restaurant.slug}-menu-qr`, 'png')}>
                <Download size={16} className="mr-2" aria-hidden /> PNG
              </Button>
              <Button variant="ghost" onClick={() => void download('qr-main', `${restaurant.slug}-menu-qr`, 'svg')}>
                <Download size={16} className="mr-2" aria-hidden /> SVG
              </Button>
              <Button variant="ghost" onClick={() => print('main')}>
                <Printer size={16} className="mr-2" aria-hidden /> Print
              </Button>
              <Button variant="ghost" onClick={() => void copyLink()}>
                <Copy size={16} className="mr-2" aria-hidden /> {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
        <div>
          <h2 className="text-lg font-medium">Table QR codes</h2>
          <p className="text-sm text-stone-500">Each table gets its own code, so you know which table a visit came from.</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Field label="Number of tables" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <Button onClick={() => void addTables()}>Create tables</Button>
          {tables.length > 0 && (
            <Button variant="ghost" onClick={() => print('tables')}>
              <Printer size={16} className="mr-2" aria-hidden /> Print all table cards
            </Button>
          )}
        </div>

        {tables.length === 0 ? (
          <p className="text-stone-500">No tables yet. Enter how many you have and click Create tables.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {tables.map((t) => {
              const id = `qr-table-${t.id}`
              return (
                <li key={t.id} className="rounded-xl border border-stone-200 p-3 text-center">
                  <div id={id} className="mx-auto w-fit">
                    <QRCodeSVG value={menuUrl(baseUrl, restaurant.slug, t.table_number)} size={112} level="M" marginSize={1} />
                  </div>
                  <p className="mt-2 font-semibold">Table {t.table_number}</p>
                  <div className="mt-1 flex justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => void download(id, `${restaurant.slug}-table-${t.table_number}`, 'png')}
                      aria-label={`Download QR for table ${t.table_number}`}
                      title="Download PNG"
                      className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTable(t)}
                      aria-label={`Delete table ${t.table_number}`}
                      title="Delete"
                      className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* What gets printed. Hidden on screen, shown only when printing. */}
      <div className="print-area hidden print:block">
        <div className={printing === 'tables' ? 'grid grid-cols-2 gap-6 p-4' : 'flex justify-center p-8'}>
          {(printing === 'tables' ? tables.map((t) => ({ key: t.id, label: `Table ${t.table_number}`, url: menuUrl(baseUrl, restaurant.slug, t.table_number) })) : printing === 'main' ? [{ key: 'main', label: '', url: mainUrl }] : []).map((card) => (
            <div key={card.key} className="break-inside-avoid rounded-2xl border-2 border-black p-6 text-center" style={{ pageBreakInside: 'avoid' }}>
              <p className="text-2xl font-bold" style={serif}>
                {restaurant.name}
              </p>
              <p className="mb-3 mt-1 text-base">Scan to view our menu</p>
              <div className="mx-auto w-fit">
                <QRCodeSVG value={card.url} size={printing === 'tables' ? 200 : 300} level="M" marginSize={1} />
              </div>
              {card.label && <p className="mt-3 text-xl font-semibold">{card.label}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
