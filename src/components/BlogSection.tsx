"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface BlogSectionProps {
  limit?: number;
  showFilters?: boolean;
}

type BlogSummary = {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  image: string;
  createdAt: string;
};

export default function BlogSection({ limit = 3, showFilters = true }: BlogSectionProps) {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/blogs", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load blogs");
        if (active) setBlogs(data.blogs || []);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load blogs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo( () => ["All", ...Array.from(new Set(blogs.map((blog) => blog.category)))], [blogs], );
  
  const filtered = selectedCategory === "All"
    ? blogs
    : blogs.filter((blog) => blog.category === selectedCategory);
  const visibleBlogs = limit ? filtered.slice(0, limit) : filtered;

  return (
    <section id="blog" className="border-t border-slate-200/80 bg-[#FBFBFC] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              INSIGHTS &amp; GUIDES
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Recent News &amp; Articles</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Explore the latest articles and stories from our community.
            </p>
          </div>
          <Link href="/blog" className="shrink-0 text-sm font-bold text-slate-900 hover:text-emerald-700">
            Browse All Articles →
          </Link>
        </div>

        {showFilters && categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  selectedCategory === category
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading && <p className="py-10 text-center text-sm text-slate-500">Loading articles…</p>}
        {error && <p role="alert" className="py-10 text-center text-sm text-rose-600">{error}</p>}
        {!loading && !error && visibleBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visibleBlogs.map((blog) => (
              <article key={blog._id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition hover:shadow-lg">
                <Link href={`/blog/${blog.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  <img src={blog.image} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-900">{blog.category}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-slate-400">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-700">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{blog.subtitle}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2.5">
                      {blog.authorAvatar ? (
                        <img src={blog.authorAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                          {blog.authorName.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{blog.authorName}</p>
                        <p className="text-[10px] text-slate-500">{blog.authorRole}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${blog.slug}`} className="text-xs font-bold text-emerald-700">Read more →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && visibleBlogs.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">New articles will appear here soon.</p>
        )}
      </div>
    </section>
  );
}
