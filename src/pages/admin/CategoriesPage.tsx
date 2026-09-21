import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRestaurant } from "../../context/RestaurantContext";
import {
  createCategory,
  deleteCategory,
  listCategories,
  swapCategoryOrder,
  updateCategory,
} from "../../services/categories";
import type { Category } from "../../services/categories";
import { categorySchema } from "../../validation/category";
import type { CategoryFormValues } from "../../validation/category";

export default function CategoriesPage() {
  const { restaurant } = useRestaurant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!restaurant) return;
    refresh();
  }, [restaurant?.id]);

  async function refresh() {
    if (!restaurant) return;
    setLoading(true);
    try {
      const data = await listCategories(restaurant.id);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load categories");
    } finally {
      setLoading(false);
    }
  }

  async function onAdd(values: CategoryFormValues) {
    if (!restaurant) return;
    setError(null);
    try {
      const created = await createCategory(restaurant.id, values);
      setCategories((prev) => [...prev, created]);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add category");
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    editForm.reset({ name: category.name, description: category.description ?? "" });
  }

  async function onSaveEdit(values: CategoryFormValues) {
    if (!editingId) return;
    setSavingId(editingId);
    try {
      const updated = await updateCategory(editingId, values);
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes");
    } finally {
      setSavingId(null);
    }
  }

  async function onDelete(category: Category) {
    const ok = window.confirm(
      `Delete "${category.name}"? Menu items in this category will need a new category before they can be shown again.`
    );
    if (!ok) return;
    setSavingId(category.id);
    try {
      await deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete category");
    } finally {
      setSavingId(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const a = categories[index];
    const b = categories[targetIndex];
    setSavingId(a.id);
    try {
      await swapCategoryOrder(a, b);
      const next = [...categories];
      next[index] = { ...b, display_order: a.display_order };
      next[targetIndex] = { ...a, display_order: b.display_order };
      setCategories(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reorder categories");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
      <p className="mt-1 text-gray-500">Group your menu into sections like Starters, Drinks or Desserts.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-gray-900">Add a category</h2>
        <form onSubmit={handleSubmit(onAdd)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register("name")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Starters"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short description (optional)</label>
            <input
              {...register("description")}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Small plates to share"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add category"}
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-gray-500">No categories yet. Add your first one above.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((category, index) => (
              <li key={category.id} className="p-4">
                {editingId === category.id ? (
                  <form
                    onSubmit={editForm.handleSubmit(onSaveEdit)}
                    className="space-y-3"
                  >
                    <input
                      {...editForm.register("name")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                    {editForm.formState.errors.name && (
                      <p className="text-sm text-red-600">
                        {editForm.formState.errors.name.message}
                      </p>
                    )}
                    <input
                      {...editForm.register("description")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Short description (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={savingId === category.id}
                        className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || savingId === category.id}
                        title="Move up"
                        className="rounded-md border border-gray-300 px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === categories.length - 1 || savingId === category.id}
                        title="Move down"
                        className="rounded-md border border-gray-300 px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => startEdit(category)}
                        className="ml-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(category)}
                        disabled={savingId === category.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
