"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;

type Blog = {
  _id: string;
  title: string;
  subtitle: string;
  content: string;
  slug: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  image: string;
  commentsEnabled: boolean;
  createdAt: string;
};

type Category = {
  _id: string;
  name: string;
};

type BlogForm = {
  title: string;
  subtitle: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  commentsEnabled: boolean;
};

const EMPTY_FORM: BlogForm = {
  title: "",
  subtitle: "",
  content: "",
  category: "",
  authorName: "",
  authorRole: "",
  commentsEnabled: true,
};

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function insertLink() {
    const url = window.prompt("Enter the link URL");
    if (url) runCommand("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("Enter the image URL");
    if (url) runCommand("insertImage", url);
  }

  const tools = [
    { label: "Bold", action: () => runCommand("bold"), style: "font-bold" },
    { label: "Italic", action: () => runCommand("italic"), style: "italic" },
    { label: "Underline", action: () => runCommand("underline"), style: "underline" },
    { label: "Heading 2", action: () => runCommand("formatBlock", "h2"), style: "font-bold" },
    { label: "Heading 3", action: () => runCommand("formatBlock", "h3"), style: "font-bold" },
    { label: "Bulleted list", action: () => runCommand("insertUnorderedList"), style: "" },
    { label: "Numbered list", action: () => runCommand("insertOrderedList"), style: "" },
    { label: "Quote", action: () => runCommand("formatBlock", "blockquote"), style: "" },
    { label: "Code", action: () => runCommand("formatBlock", "pre"), style: "font-mono" },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <div className="flex flex-wrap gap-1 border-b bg-slate-50 p-2">
        {tools.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            aria-label={tool.label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={tool.action}
            className={`rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-emerald-50 ${tool.style}`}
          >
            {tool.label}
          </button>
        ))}
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertLink} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-emerald-50">Link</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={insertImage} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-emerald-50">Image URL</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("undo")} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-emerald-50">Undo</button>
        <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("redo")} className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-emerald-50">Redo</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Article content"
        aria-multiline="true"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="blog-editor min-h-64 space-y-3 bg-white p-4 text-sm leading-7 outline-none"
      />
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [image, setImage] = useState<File | null>(null);
  const [authorAvatar, setAuthorAvatar] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState("");

  const totalPages = Math.ceil(blogs.length / PAGE_SIZE);
  const pageBlogs = useMemo(
    () => blogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [blogs, currentPage],
  );

  async function loadBlogs() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/blogs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load blogs");
      setBlogs(data.blogs || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load blogs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBlogs();
    fetch("/api/categories", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load categories");
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "Could not load categories");
      });
  }, []);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImage(null);
    setAuthorAvatar(null);
    setError("");
    setModalOpen(true);
  }

  function openEdit(blog: Blog) {
    setEditing(blog);
    setForm({
      title: blog.title,
      subtitle: blog.subtitle,
      content: blog.content,
      category: blog.category,
      authorName: blog.authorName,
      authorRole: blog.authorRole,
      commentsEnabled: blog.commentsEnabled,
    });
    setImage(null);
    setAuthorAvatar(null);
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!editing && !image) {
      setError("Select a blog image");
      return;
    }
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (image) formData.append("image", image);
    if (authorAvatar) formData.append("authorAvatar", authorAvatar);

    setSaving(true);
    try {
      const response = await fetch(
        editing ? `/api/admin/blogs/${editing._id}` : "/api/admin/blogs",
        { method: editing ? "PUT" : "POST", body: formData },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save blog");
      setModalOpen(false);
      setNotice(editing ? "Blog updated." : "Blog created.");
      await loadBlogs();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save blog");
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlog(blog: Blog) {
    if (!window.confirm(`Delete "${blog.title}"? This will also delete its comments.`)) return;
    setDeletingId(blog._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/blogs/${blog._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete blog");
      setNotice("Blog deleted.");
      await loadBlogs();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete blog");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blogs</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage public blog articles.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Add Blog
        </button>
      </header>

      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      {error && !modalOpen && <p role="alert" className="text-sm text-rose-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Blog</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Comments</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">Loading blogs…</td></tr>
            ) : blogs.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-slate-400">No blogs created yet.</td></tr>
            ) : pageBlogs.map((blog, index) => (
              <tr key={blog._id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-500">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={blog.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{blog.title}</p>
                      {/* <p className="line-clamp-1 text-xs text-slate-500">{blog.subtitle}</p> */}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{blog.authorName}</p>
                  <p className="text-xs text-slate-500">{blog.authorRole}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{blog.category}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={blog.commentsEnabled ? "text-emerald-700" : "text-slate-400"}>
                    {blog.commentsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => openEdit(blog)} className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">Edit</button>
                    <button type="button" disabled={deletingId === blog._id} onClick={() => void deleteBlog(blog)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50">
                      {deletingId === blog._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, blogs.length)} of {blogs.length}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button>
          </div>
        </nav>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <section className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-bold">{editing ? "Edit Blog" : "Create Blog"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-xl text-slate-500" aria-label="Close">×</button>
            </header>
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">Title
                  <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">Category
                  <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border bg-white px-3 py-2 font-normal">
                    <option value="">Select a category</option>
                    {form.category && !categories.some((category) => category.name === form.category) && (
                      <option value={form.category}>{form.category}</option>
                    )}
                    {categories.map((category) => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1 text-sm font-medium">Subtitle
                <textarea required rows={2} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="w-full rounded-lg border px-3 py-2 font-normal" />
              </label>
              <div className="space-y-1 text-sm font-medium">
                <span>Article content</span>
                <RichTextEditor
                  value={form.content}
                  onChange={(content) => setForm((current) => ({ ...current, content }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">Author name
                  <input required value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} className="w-full rounded-lg border px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">Author role
                  <input required value={form.authorRole} onChange={(event) => setForm({ ...form, authorRole: event.target.value })} className="w-full rounded-lg border px-3 py-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">Blog image {editing ? "(optional)" : ""}
                  <input accept="image/*" required={!editing} type="file" onChange={(event) => setImage(event.target.files?.[0] || null)} className="w-full rounded-lg border p-2 font-normal" />
                </label>
                <label className="space-y-1 text-sm font-medium">Author image (optional)
                  <input accept="image/*" type="file" onChange={(event) => setAuthorAvatar(event.target.files?.[0] || null)} className="w-full rounded-lg border p-2 font-normal" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.commentsEnabled} onChange={(event) => setForm({ ...form, commentsEnabled: event.target.checked })} />
                Allow signed-in users and freelancers to comment
              </label>
              {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
              <footer className="flex justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
                <button disabled={saving} type="submit" className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {saving ? "Saving…" : editing ? "Save Changes" : "Create Blog"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
