"use client";

import CategoryIcon from "@/components/ui/CategoryIcon";
import { formatDate, formatDateTime } from "@/lib/formatDate";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Category = {
  _id: string;
  name: string;
  icon: string;
  count: number;
  createdAt?: string;
  updatedAt?: string;
};
type ModalState =
  | { type: "add" }
  | { type: "edit"; category: Category }
  | { type: "delete"; category: Category }
  | null;

const MAX_SVG = 20000;
const ITEMS_PER_PAGE = 10;
const isSvg = (s: string) => /<svg[\s>]/i.test(s);

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white";
const labelCls = "block text-xs font-bold text-slate-700 mb-1.5";

/* ---------- Shared modal shell ---------- */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    // Lock background scroll while the modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Add / Edit form ---------- */
function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: Category;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [svg, setSvg] = useState(category?.icon ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewSrc = isSvg(svg)
    ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Category name is required.");
    if (!isSvg(svg)) return setError("Please enter a valid SVG code.");
    if (svg.length > MAX_SVG) return setError("SVG must be under 20KB.");

    setLoading(true);
    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/categories/${category!._id}`
          : "/api/admin/categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, icon: svg }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save category.");
        return;
      }
      onSaved(
        isEdit
          ? `"${data.name}" updated successfully.`
          : `"${data.name}" created successfully.`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Category Name *</label>
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Data Science & Analytics"
          maxLength={60}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>SVG Icon *</label>
          <textarea
            className={`${inputCls} font-mono text-xs`}
            rows={6}
            value={svg}
            onChange={(e) => setSvg(e.target.value)}
            placeholder={
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">...</svg>'
            }
          />
        </div>

        <div>
          <label className={labelCls}>Preview</label>
          <div className="h-28 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
            {previewSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc} alt="Icon preview" className="w-12 h-12" />
            ) : (
              <span className="text-xs text-slate-400">No icon</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Delete confirmation ---------- */
function DeleteConfirm({
  category,
  onClose,
  onDeleted,
}: {
  category: Category;
  onClose: () => void;
  onDeleted: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasWorkers = category.count > 0;

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete category.");
        return;
      }
      onDeleted(`"${category.name}" deleted successfully.`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Are you sure you want to delete{" "}
        <strong className="text-slate-900">{category.name}</strong>? This action
        cannot be undone.
      </p>

      {hasWorkers && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          This category is used by <strong>{category.count}</strong>{" "}
          {category.count === 1 ? "worker" : "workers"}. Move or delete them
          first, then you can delete this category.
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
        >
          No, Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || hasWorkers}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Deleting..." : "Yes, Delete"}
        </button>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [notice, setNotice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
  const pageCategories = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setCategories(await res.json());
      setListError("");
    } catch {
      setListError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  const closeModal = useCallback(() => setModal(null), []);

  const handleDone = (message: string) => {
    setModal(null);
    setNotice(message);
    load(); // reload to get fresh worker counts
    setTimeout(() => setNotice(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your service categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "add" })}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0"
        >
          + Add Category
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          {notice}
        </div>
      )}
      {listError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {listError}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500 font-mono">
              <th className="px-4 py-3 w-12">No</th>
              <th className="px-4 py-3 w-14">Icon</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Services</th>
              <th className="px-4 py-3 whitespace-nowrap">Created At</th>
              <th className="px-4 py-3 whitespace-nowrap">Updated At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-xs text-slate-400"
                >
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-xs text-slate-400"
                >
                  No categories yet. Click &quot;Add Category&quot; to create
                  your first one.
                </td>
              </tr>
            ) : (
              pageCategories.map((c, index) => (
                <tr key={c._id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 align-middle text-slate-500">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <CategoryIcon
                      svg={c.icon}
                      className="w-6 h-6 text-emerald-800"
                    />
                  </td>

                  <td className="px-4 py-3 align-middle font-semibold text-slate-900">
                    {c.name}
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        c.count > 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {c.count} {c.count === 1 ? "service" : "services"}
                    </span>
                  </td>

                  <td
                    className="px-4 py-3 align-middle text-slate-600 whitespace-nowrap"
                    title={formatDateTime(c.createdAt)}
                  >
                    {formatDate(c.createdAt)}
                  </td>

                  <td
                    className="px-4 py-3 align-middle text-slate-600 whitespace-nowrap"
                    title={formatDateTime(c.updatedAt)}
                  >
                    {formatDate(c.updatedAt)}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setModal({ type: "edit", category: c })}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ type: "delete", category: c })
                        }
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && categories.length > 0 && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} of{" "}
            {categories.length} categories
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modal?.type === "add" && (
        <Modal title="Add Category" onClose={closeModal}>
          <CategoryForm onClose={closeModal} onSaved={handleDone} />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title="Edit Category" onClose={closeModal}>
          <CategoryForm
            category={modal.category}
            onClose={closeModal}
            onSaved={handleDone}
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal title="Delete Category" onClose={closeModal}>
          <DeleteConfirm
            category={modal.category}
            onClose={closeModal}
            onDeleted={handleDone}
          />
        </Modal>
      )}
    </div>
  );
}
