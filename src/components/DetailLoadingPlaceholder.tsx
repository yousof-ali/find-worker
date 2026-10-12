function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function FreelancerDetailPlaceholder() {
  return (
    <main
      aria-label="Loading freelancer profile"
      aria-busy="true"
      className="min-h-screen bg-white px-4 pb-20 pt-32 text-slate-900 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-3xl border border-orange-100 bg-orange-50 p-6 sm:p-9">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <SkeletonBlock className="h-24 w-24 shrink-0 rounded-full bg-orange-100 sm:h-28 sm:w-28" />
                <div className="w-full space-y-3">
                  <SkeletonBlock className="mx-auto h-7 w-56 bg-orange-100 sm:mx-0" />
                  <SkeletonBlock className="mx-auto h-4 w-36 bg-orange-100 sm:mx-0" />
                  <div className="flex justify-center gap-4 pt-2 sm:justify-start">
                    <SkeletonBlock className="h-4 w-20 bg-orange-100" />
                    <SkeletonBlock className="h-4 w-24 bg-orange-100" />
                    <SkeletonBlock className="h-4 w-20 bg-orange-100" />
                  </div>
                </div>
              </div>
            </section>
            <section className="space-y-4 rounded-2xl border border-slate-200 p-6">
              <SkeletonBlock className="h-6 w-40" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-4/5" />
            </section>
            <section className="space-y-4 rounded-2xl border border-slate-200 p-6">
              <SkeletonBlock className="h-6 w-44" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SkeletonBlock className="aspect-[16/10]" />
                <SkeletonBlock className="aspect-[16/10]" />
              </div>
            </section>
          </div>
          <aside className="space-y-5 lg:col-span-4">
            <SkeletonBlock className="h-48 rounded-2xl" />
            <SkeletonBlock className="h-64 rounded-2xl" />
          </aside>
        </div>
      </div>
      <span className="sr-only">Loading freelancer details…</span>
    </main>
  );
}

export function BlogDetailPlaceholder() {
  return (
    <main
      aria-label="Loading blog article"
      aria-busy="true"
      className="min-h-screen bg-white px-4 pb-20 pt-28 text-slate-900 sm:px-6"
    >
      <article className="mx-auto max-w-4xl">
        <div className="mb-8 flex gap-2">
          <SkeletonBlock className="h-4 w-12" />
          <SkeletonBlock className="h-4 w-4" />
          <SkeletonBlock className="h-4 w-14" />
          <SkeletonBlock className="h-4 w-4" />
          <SkeletonBlock className="h-4 w-28" />
        </div>
        <SkeletonBlock className="h-6 w-32 rounded-full" />
        <SkeletonBlock className="mt-5 h-10 w-full sm:h-14" />
        <SkeletonBlock className="mt-3 h-10 w-4/5 sm:h-14" />
        <SkeletonBlock className="mt-5 h-5 w-full" />
        <SkeletonBlock className="mt-2 h-5 w-2/3" />
        <div className="mt-7 flex items-center gap-3 border-b border-slate-100 pb-7">
          <SkeletonBlock className="h-11 w-11 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-3 w-24" />
          </div>
        </div>
        <SkeletonBlock className="mt-8 aspect-[16/9] w-full rounded-3xl" />
        <div className="mt-10 space-y-4">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
        </div>
      </article>
      <span className="sr-only">Loading blog article…</span>
    </main>
  );
}
