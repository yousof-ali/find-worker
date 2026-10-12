"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
  
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const search = searchQuery.toLowerCase();
    const matchesSearch = [blog.title, blog.subtitle, blog.authorName, blog.category]
      .some((value) => value.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#FBFBFC] px-4 pb-20 pt-28 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="py-10 text-center sm:py-14">
          <span className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            BLOG &amp; STORIES
          </span>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Ideas, insights &amp; guides</h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Read the latest articles and stories from our community.
          </p>
          <label className="mx-auto mt-8 block max-w-xl">
            <span className="sr-only">Search blogs</span>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search articles, topics, or authors…"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
          {categories.length > 1 && (
            <div className="mt-7 flex flex-wrap justify-center gap-2">
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
        </header>

        {error && <p role="alert" className="py-16 text-center text-rose-600">{error}</p>}
        {loading && <p className="py-16 text-center text-slate-500">Loading blogs…</p>}
        {!loading && !error && filteredBlogs.length > 0 && (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredBlogs.map((blog) => (
              <article key={blog._id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                <Link href={`/blog/${blog.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                  <img src={blog.image} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800">{blog.category}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs text-slate-400">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 group-hover:text-emerald-700">
                    <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                  </h2>
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
        {!loading && !error && filteredBlogs.length === 0 && (
          <p className="py-20 text-center text-slate-500">
            {blogs.length ? "No articles match your search." : "No blog articles have been published yet."}
          </p>
        )}
      </section>
    </main>
  );
}
