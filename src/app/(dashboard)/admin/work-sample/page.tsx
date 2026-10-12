"use client";

// app/admin/work-samples/page.tsx
import React, { useEffect, useState } from "react";

const API = "/api/admin"; // withAuth protected admin routes
const ITEMS_PER_PAGE = 7;
const fileUrl = (p: string) => p; // preview = '/uploads/work-samples/xxx' (public folder theke serve hoy)

type ProjectType = "design" | "video";

interface WorkSample {
  _id: string;
  title: string;
  subTitle: string;
  tools: string[];
  projectType: ProjectType;
  preview: string;
  clientName: string;
  deliveryDate: string;
  seller?: { _id: string; name: string; avatar?: string } | null;
}

const emptyForm = {
  title: "",
  subTitle: "",
  tools: "",
  projectType: "design" as ProjectType,
  clientName: "",
  deliveryDate: "",
};

export default function AdminWorkSamplesPage() {
  const [items, setItems] = useState<WorkSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const pageItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<WorkSample | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toDelete, setToDelete] = useState<WorkSample | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth cookie same-origin request e auto jay
  const authHeaders: Record<string, string> = {};

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/work-samples`, { headers: authHeaders });
      const json = await res.json();
      setItems(json.workSamples || []);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFile(null);
    setLocalPreview(null);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (item: WorkSample) => {
    setEditing(item);
    setForm({
      title: item.title,
      subTitle: item.subTitle || "",
      tools: item.tools.join(", "),
      projectType: item.projectType,
      clientName: item.clientName || "",
      deliveryDate: item.deliveryDate
        ? new Date(item.deliveryDate).toISOString().slice(0, 10)
        : "",
    });
    setFile(null);
    setLocalPreview(null);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsOpen(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setLocalPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleTypeChange = (t: ProjectType) => {
    setForm((p) => ({ ...p, projectType: t }));
    // file type no longer matches -> reset
    setFile(null);
    setLocalPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const typeChanged = editing && editing.projectType !== form.projectType;
    if (!editing && !file) return setError("Please select a preview file");
    if (typeChanged && !file)
      return setError("Select a new preview for the new project type");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("subTitle", form.subTitle);
    fd.append("tools", form.tools); // comma separated -> array on server
    fd.append("projectType", form.projectType);
    fd.append("clientName", form.clientName);
    fd.append("deliveryDate", form.deliveryDate);
    if (file) fd.append("preview", file);

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `${API}/work-samples/${editing._id}` : `${API}/work-samples`,
        { method: editing ? "PUT" : "POST", body: fd, headers: authHeaders },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Something went wrong");
      setIsOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/work-samples/${toDelete._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setToDelete(null);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isVideo = form.projectType === "video";
  const existingPreview =
    editing && editing.projectType === form.projectType
      ? editing.preview
      : null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Samples</h1>
          <p className="text-sm text-slate-500">
            Create projects here, then attach them to sellers.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer"
        >
          + Add Work Sample
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Preview</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Tools</th>
              <th className="text-left px-4 py-3">Seller</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  No work samples yet.
                </td>
              </tr>
            ) : (
              pageItems.map((item, i) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-500">
                    {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900">
                      {item.projectType === "video" ? (
                        <video
                          src={fileUrl(item.preview)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={fileUrl(item.preview)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">
                      {truncateText(item.title, 30)}
                    </div>

                    <div className="text-xs text-slate-500">
                      {truncateText(item.subTitle, 40)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.projectType === "video"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-indigo-50 text-indigo-700"
                      }`}
                    >
                      {item.projectType === "video" ? "Video" : "Design & UI"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.tools.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {item.seller ? (
                      <div className="flex items-center gap-2">
                        {item.seller.avatar && (
                          <img
                            src={fileUrl(item.seller.avatar)}
                            alt={item.seller.name || "Assigned"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}

                        <span className="text-emerald-700 font-medium">
                          {item.seller.name || "Assigned"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setToDelete(item)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
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

      {!loading && items.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, items.length)} of{" "}
            {items.length} work samples
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

      {/* Create / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editing ? "Edit Work Sample" : "Add Work Sample"}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fintech Mobile Banking App"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sub Title
                </label>
                <input
                  value={form.subTitle}
                  onChange={(e) =>
                    setForm({ ...form, subTitle: e.target.value })
                  }
                  placeholder="Short description"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tools{" "}
                  <span className="font-normal text-slate-400">
                    (comma separated)
                  </span>
                </label>
                <input
                  value={form.tools}
                  onChange={(e) => setForm({ ...form, tools: e.target.value })}
                  placeholder="Figma, After Effects, Protopie"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.tools
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800"
                      >
                        {t}
                      </span>
                    ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="md:w-1/2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Client Name
                  </label>
                  <input
                    required
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    placeholder="e.g. Jhon"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="md:w-1/2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deliery Date
                  </label>
                  <input
                    required
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) =>
                      setForm({ ...form, deliveryDate: e.target.value })
                    }
                    placeholder="YYYY-MM"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Type
                </label>
                <select
                  value={form.projectType}
                  onChange={(e) =>
                    handleTypeChange(e.target.value as ProjectType)
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="design">Design &amp; UI</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preview {isVideo ? "(single video)" : "(single image)"}
                </label>
                <input
                  key={form.projectType}
                  type="file"
                  accept={isVideo ? "video/*" : "image/*"}
                  onChange={handleFile}
                  className="w-full text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:text-xs file:font-semibold file:cursor-pointer"
                />

                {(localPreview || existingPreview) && (
                  <div className="mt-3 rounded-xl overflow-hidden bg-slate-900 aspect-video">
                    {isVideo ? (
                      <video
                        src={localPreview || fileUrl(existingPreview!)}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={localPreview || fileUrl(existingPreview!)}
                        alt="preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}
                {editing && !file && existingPreview && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave empty to keep the current preview.
                  </p>
                )}
              </div>

              {error && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
                >
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Delete work sample?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              &quot;{toDelete.title}&quot; will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
