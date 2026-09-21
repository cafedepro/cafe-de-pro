export function menuUrl(baseUrl: string, slug: string, table?: string): string {
  const base = baseUrl.trim().replace(/\/+$/, '')
  const url = `${base}/menu/${slug}`
  return table ? `${url}?table=${encodeURIComponent(table)}` : url
}

// True when the address only works on this computer (so phones cannot open it).
export function isLocalAddress(baseUrl: string): boolean {
  return /^(https?:\/\/)?(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)/i.test(baseUrl.trim())
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function standaloneSvg(svg: SVGSVGElement, px: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(px))
  clone.setAttribute('height', String(px))
  return new XMLSerializer().serializeToString(clone)
}

export function downloadSvg(svg: SVGSVGElement, filename: string) {
  triggerDownload(new Blob([standaloneSvg(svg, 1024)], { type: 'image/svg+xml;charset=utf-8' }), filename)
}

export async function downloadPng(svg: SVGSVGElement, filename: string, px = 1024): Promise<void> {
  const svgUrl = URL.createObjectURL(new Blob([standaloneSvg(svg, px)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not create the image. Try the SVG download instead.'))
      img.src = svgUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Your browser could not create the image.')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, px, px)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, 0, 0, px, px)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Could not create the image.')
    triggerDownload(blob, filename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

export function findSvg(containerId: string): SVGSVGElement | null {
  return document.getElementById(containerId)?.querySelector('svg') ?? null
}
