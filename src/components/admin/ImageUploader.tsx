import { useId, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from './ui'
import { resizeToWebp } from '../../lib/imageResize'
import { imageStorage, newImagePath } from '../../services/storage'
import { cn } from '../../lib/utils'

interface Props {
  label: string
  hint?: string
  value: string // current image URL, '' when none
  restaurantId: string
  folder: 'logo' | 'cover' | 'items'
  maxDimension: number
  shape?: 'square' | 'wide'
  onChange: (url: string) => void | Promise<void>
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 15 * 1024 * 1024

export default function ImageUploader({ label, hint, value, restaurantId, folder, maxDimension, shape = 'square', onChange }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!ALLOWED.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError('That image is too large. Please choose one under 15 MB.')
      return
    }
    setBusy(true)
    try {
      const blob = await resizeToWebp(file, maxDimension)
      const url = await imageStorage.upload(blob, newImagePath(restaurantId, folder))
      await onChange(url)
    } catch (e) {
      const message = e instanceof Error ? e.message : ''
      setError(
        /bucket not found/i.test(message)
          ? 'The image storage is not set up yet. Run the storage SQL in Supabase, then try again.'
          : `Could not upload the image. ${message}`.trim(),
      )
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-800">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        {value ? (
          <img
            src={value}
            alt={`${label} preview`}
            className={cn('rounded-xl border border-stone-200 object-cover', shape === 'square' ? 'h-24 w-24' : 'h-28 w-full max-w-xs')}
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              'grid place-items-center rounded-xl border border-dashed border-stone-300 bg-stone-50 text-stone-400',
              shape === 'square' ? 'h-24 w-24' : 'h-28 w-full max-w-xs',
            )}
          >
            <ImagePlus size={26} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(',')}
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <Button type="button" variant="ghost" loading={busy} onClick={() => inputRef.current?.click()}>
            <ImagePlus size={16} className="mr-2" aria-hidden /> {value ? 'Replace photo' : 'Upload photo'}
          </Button>
          {value && !busy && (
            <Button type="button" variant="ghost" onClick={() => void onChange('')}>
              <Trash2 size={16} className="mr-2" aria-hidden /> Remove
            </Button>
          )}
        </div>
      </div>
      {hint && !error && <p className="text-sm text-stone-500">{hint}</p>}
      <p role="alert" className="text-sm text-red-700">
        {error}
      </p>
    </div>
  )
}
