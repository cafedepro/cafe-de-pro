import { supabase } from '../lib/supabase'

// The rest of the app only talks to this interface. To move images to another
// provider later (Cloudflare R2, Cloudinary...), implement it here and nothing
// else in the app needs to change.
export interface ImageStorage {
  upload(blob: Blob, path: string): Promise<string> // returns the public URL
}

const BUCKET = 'restaurant-media'

export const imageStorage: ImageStorage = {
  async upload(blob, path) {
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })
    if (error) throw error
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  },
}

// Files live under <restaurant_id>/..., which is what the storage security rules check.
export function newImagePath(restaurantId: string, folder: 'logo' | 'cover' | 'items'): string {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return `${restaurantId}/${folder}/${id}.webp`
}
