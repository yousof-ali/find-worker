"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { BlogDetailPlaceholder } from "@/components/DetailLoadingPlaceholder";

type Blog = {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  image: string;
  commentsEnabled: boolean;
  createdAt: string;
};

type BlogComment = {
  _id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
};

export default function BlogDetails({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/blogs/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load blog");
        if (!active) return;
        setBlog(data.blog);
        setComments(data.comments || []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load blog");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!user) {
      setError("Please sign in before posting a reply.");
      return;
    }
    if (user.role !== "user" && user.role !== "worker") {
      setError("Only signed-in users and freelancers can post a reply.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not post comment");
      setComments((existing) => [data.comment, ...existing]);
      setComment("");
      setNotice("Your comment has been posted.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <BlogDetailPlaceholder />;
  }
  if (!blog) {
    return (
      <main className="min-h-screen px-4 pt-32 text-center">
        <p role="alert" className="text-slate-600">{error || "Blog not found."}</p>
        <Link href="/blog" className="mt-4 inline-block font-semibold text-emerald-700">Back to blogs</Link>
      </main>
    );
  }

  const canComment = user?.role === "user" || user?.role === "worker";

  return (
    <main className="min-h-screen bg-white px-4 pb-20 pt-28 text-slate-900 sm:px-6">
      <article className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 flex gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">Home</Link><span>/</span>
          <Link href="/blog" className="hover:text-slate-900">Blog</Link><span>/</span>
          <span className="text-emerald-700">{blog.category}</span>
        </nav>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{blog.category}</span>
        <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{blog.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{blog.subtitle}</p>
        <div className="mt-7 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-7">
          <div className="flex items-center gap-3">
            {blog.authorAvatar ? (
              <img src={blog.authorAvatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-700">
                {blog.authorName.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm font-bold">{blog.authorName}</p>
              <p className="text-xs text-slate-500">{blog.authorRole}</p>
            </div>
          </div>
          <span className="text-sm text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
        <img src={blog.image} alt={blog.title} className="mt-8 max-h-[520px] w-full rounded-3xl object-cover" />
        <div
          className="blog-content mt-10 text-base leading-8 text-slate-700"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
          
          {error && <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p>}
          {notice && <p role="status" className="mt-3 text-sm text-emerald-700">{notice}</p>}
          <div className="mt-8 space-y-4">
            {comments.map((item) => (
              <article key={item._id} className="rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  {item.authorAvatar ? (
                    <img src={item.authorAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                      {item.authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{item.authorName}</p>
                    <p className="text-xs text-slate-500">{item.authorRole} · {new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.content}</p>
              </article>
            ))}
            {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
          </div>
          {blog.commentsEnabled ? (
              <form onSubmit={submitComment} className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
                <label htmlFor="blog-comment" className="block text-sm font-semibold">Write a comment</label>
                <textarea
                  id="blog-comment"
                  required
                  maxLength={2000}
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share your thoughts…"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {authLoading
                      ? "Checking sign-in…"
                      : canComment
                        ? `Replying as ${user?.firstName} ${user?.lastName}`
                        : "Sign in with a user or freelancer account to reply"}
                  </span>
                  <button disabled={submitting} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                    {submitting ? "Posting…" : "Post reply"}
                  </button>
                </div>
              </form>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <label htmlFor="blog-comment" className="block text-sm font-semibold">Write a reply</label>
              <textarea id="blog-comment" rows={4} disabled placeholder="Replies are disabled for this article." className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm disabled:bg-slate-100" />
              <button type="button" disabled className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white opacity-50">Post reply</button>
              <p className="mt-2 text-xs text-slate-500">Replies are disabled for this article.</p>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
