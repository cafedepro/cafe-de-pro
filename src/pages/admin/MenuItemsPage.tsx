import { useEffect, useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { listCategories } from "../../services/categories";
import type { Category } from "../../services/categories";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  toggleAvailability,
  updateMenuItem,
} from "../../services/menuItems";
import type { MenuItem } from "../../services/menuItems";
import { ItemForm } from "../../components/admin/ItemForm";

export default function MenuItemsPage() {
  const { restaurant } = useRestaurant();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurant) return;
    refresh();
  }, [restaurant?.id]);

  async function refresh() {
    if (!restaurant) return;
    setLoading(true);
    try {
      const [cats, menuItems] = await Promise.all([
        listCategories(restaurant.id),
        listMenuItems(restaurant.id),
      ]);
      setCategories(cats);
      setItems(menuItems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load menu items");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(values: Parameters<typeof createMenuItem>[1]) {
    if (!restaurant) return;
    const created = await createMenuItem(restaurant.id, values);
    setItems((prev) => [...prev, created]);
    setShowAddForm(false);
  }

  async function handleEdit(values: Parameters<typeof updateMenuItem>[1]) {
    if (!editingItem) return;
    const updated = await updateMenuItem(editingItem.id, values);
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  }

  async function handleDelete(item: MenuItem) {
    const ok = window.confirm(`Delete "${item.name}"?`);
    if (!ok) return;
    setBusyId(item.id);
    try {
      await deleteMenuItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete item");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggle(item: MenuItem) {
    setBusyId(item.id);
    try {
      await toggleAvailability(item.id, !item.is_available);
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update item");
    } finally {
      setBusyId(null);
    }
  }

  if (!loading && categories.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Menu items</h1>
        <p className="mt-1 text-gray-500">Add dishes, change prices, and mark items sold out.</p>
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-700">Create at least one category before adding items.</p>
          <a href="/admin/categories" className="mt-1 inline-block text-emerald-700 underline">
            Go to Categories
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Menu items</h1>
          <p className="mt-1 text-gray-500">Add dishes, change prices, and mark items sold out.</p>
        </div>
        {!showAddForm && !editingItem && (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Add item
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showAddForm && restaurant && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-medium text-gray-900">Add an item</h2>
          <ItemForm
            restaurantId={restaurant.id}
            categories={categories}
            onCancel={() => setShowAddForm(false)}
            onSubmit={handleAdd}
          />
        </div>
      )}

      {editingItem && restaurant && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-medium text-gray-900">Edit item</h2>
          <ItemForm
            restaurantId={restaurant.id}
            categories={categories}
            initialItem={editingItem}
            onCancel={() => setEditingItem(null)}
            onSubmit={handleEdit}
          />
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 space-y-6">
          {categories.map((category) => {
            const categoryItems = items.filter((i) => i.category_id === category.id);
            if (categoryItems.length === 0) return null;
            return (
              <div key={category.id}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  {category.name}
                </h3>
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <ul className="divide-y divide-gray-100">
                    {categoryItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 p-4">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {!item.is_available && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                Sold out
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-500">{item.description}</p>
                          )}
                          <p className="text-sm font-medium text-gray-700">
                            ₹{Number(item.price).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <button
                            onClick={() => handleToggle(item)}
                            disabled={busyId === item.id}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                          >
                            {item.is_available ? "Mark sold out" : "Mark available"}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddForm(false);
                              setEditingItem(item);
                            }}
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={busyId === item.id}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-gray-500">No items yet. Add your first one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
