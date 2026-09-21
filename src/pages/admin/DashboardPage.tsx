import { useState } from 'react'
import { Copy, ExternalLink } from 'lucide-react'
import { useRestaurant } from '../../context/RestaurantContext'
import { publicMenuUrl } from '../../lib/utils'
import { Button } from '../../components/admin/ui'

export default function DashboardPage() {
  const { restaurant } = useRestaurant()
  const [copied, setCopied] = useState(false)
  if (!restaurant) return null
  const url = publicMenuUrl(restaurant.slug)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{restaurant.name}</h1>
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-medium">Your menu link</h2>
        <p className="mt-2 break-all text-stone-600">{url}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => void copy()}>
            <Copy size={16} className="mr-2" aria-hidden /> {copied ? 'Copied' : 'Copy link'}
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-lg px-4 py-2.5 font-medium text-stone-700 hover:bg-stone-200"
          >
            <ExternalLink size={16} className="mr-2" aria-hidden /> Preview menu
          </a>
        </div>
      </section>
    </div>
  )
}
