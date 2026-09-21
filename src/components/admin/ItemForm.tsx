import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { menuItemSchema } from "../../validation/menuItem";
import type { MenuItemFormValues } from "../../validation/menuItem";
import type { Category } from "../../services/categories";
import { uploadItemImage } from "../../services/menuItems";
import type { MenuItem } from "../../services/menuItems";

interface ItemFormProps {
  restaurantId: string;
  categories: Category[];
  initialItem?: MenuItem;
  onCancel: () => void;
  onSubmit: (values: {
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string | null;
    is_available: boolean;
  }) => Promise<void>;
}

export function ItemForm({
  restaurantId,
  categories,
  initialItem,
  onCancel,
  onSubmit,
}: ItemFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialItem?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      category_id: initialItem?.category_id ?? categories[0]?.id ?? "",
      name: initialItem?.name ?? "",
      description: initialItem?.description ?? "",
      price: initialItem ? String(initialItem.price) : "",
      is_available: initialItem?.is_available ?? true,
    },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadItemImage(restaurantId, file);
      setImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFormSubmit(values: MenuItemFormValues) {
    await onSubmit({
      category_id: values.category_id,
      name: values.name,
      description: values.description,
      price: Number(values.price),
      image_url: imageUrl,
      is_available: values.is_available,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Photo</label>
        <div className="mt-1 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">No photo</span>
            )}
          </div>
          <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            {uploading ? "Uploading..." : "Upload photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        {uploadError && <p className="mt-1 text-sm text-red-600">{uploadError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          {...register("category_id")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register("name")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          placeholder="e.g. Margherita Pizza"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
        <textarea
          {...register("description")}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          placeholder="e.g. Tomato, mozzarella, basil"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          {...register("price")}
          inputMode="decimal"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          placeholder="e.g. 249"
        />
        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_available"
          type="checkbox"
          {...register("is_available")}
          className="h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-600"
        />
        <label htmlFor="is_available" className="text-sm text-gray-700">
          Available (uncheck to mark sold out)
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : initialItem ? "Save changes" : "Add item"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
