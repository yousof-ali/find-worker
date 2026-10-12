"use client";

// components/admin/WorkerForm.tsx
// Add Seller (no workerId)  &  Edit Seller (workerId given -> default values load hoy)
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

/* ---------------- types ---------------- */
type Category = { _id: string; name: string };
type MarketplaceBadge = { platform: string; badge: string; url: string };
type Education = {
  degree: string;
  institute: string;
  startDate: string;
  endDate: string;
  description: string;
};
type Experience = {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};
type LinkedProfile = {
  platform: string;
  badge: string;
  title: string;
  subtitle: string;
  link: string;
};
type WorkSampleCard = {
  _id: string;
  title: string;
  subTitle: string;
  projectType: "design" | "video";
  preview: string;
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";
const labelCls = "block text-xs font-semibold text-slate-700 mb-1.5";

/* ---------------- small UI helpers ---------------- */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// Generic add/remove list (marketplace badges, education, experience, linked profiles)
function Repeater<T>({
  items,
  onChange,
  makeEmpty,
  addLabel,
  itemLabel,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  addLabel: string;
  itemLabel: string;
  children: (item: T, patch: (p: Partial<T>) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-slate-400">Nothing added yet.</p>
      )}
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              {itemLabel} #{i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Remove ✕
            </button>
          </div>
          {children(item, (p) =>
            onChange(
              items.map((it, idx) => (idx === i ? { ...it, ...p } : it)),
            ),
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeEmpty()])}
        className="px-3.5 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
      >
        + {addLabel}
      </button>
    </div>
  );
}

/* ---------------- main form ---------------- */
export default function WorkerForm({ workerId }: { workerId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(workerId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showpassword, setShowPassword] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [available, setAvailable] = useState<WorkSampleCard[]>([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    language: "",
    badge: "",
    category: "",
    location: "",
    dateOfBirth: "",
    about: "",
    skills: "",
    role: "worker",
    status: "approved",
    createdBy: "admin",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState("");
  const [stats, setStats] = useState<{
    rating: number;
    reviewsCount: number;
  } | null>(null);

  const [marketplaceBadges, setMarketplaceBadges] = useState<
    MarketplaceBadge[]
  >([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [linkedProfiles, setLinkedProfiles] = useState<LinkedProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const onField =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));

  /* ----- load categories, available work samples (+ worker data in edit mode) ----- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catRes, wsRes, wRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch(
            `/api/admin/work-samples/available${workerId ? `?sellerId=${workerId}` : ""}`,
            { cache: "no-store" },
          ),
          workerId
            ? fetch(`/api/admin/workers/${workerId}`, { cache: "no-store" })
            : Promise.resolve(null),
        ]);
        const cats = await catRes.json();
        const ws = await wsRes.json();
        if (cancelled) return;

        setCategories(Array.isArray(cats) ? cats : []);
        setAvailable(ws.workSamples || []);

        if (wRes) {
          const wJson = await wRes.json();
          if (!wRes.ok) throw new Error(wJson.message || "Seller not found");
          const w = wJson.worker;
          if (cancelled) return;

          setForm({
            firstName: w.user?.firstName || "",
            lastName: w.user?.lastName || "",
            email: w.user?.email || "",
            password: "",
            gender: w.gender || "",
            language: w.language || "",
            badge: w.badge || "",
            category: w.category?._id || "",
            location: w.location || "",
            dateOfBirth: w.dateOfBirth
              ? String(w.dateOfBirth).slice(0, 10)
              : "",
            about: w.about || "",
            skills: (w.skills || []).join(", "),
            role: w.user?.role || "worker",
            status: w.status || "approved",
            createdBy: w.createdBy || "admin",
          });
          setCurrentAvatar(w.user?.avatar || "");
          setStats({
            rating: w.rating || 0,
            reviewsCount: w.reviewsCount || 0,
          });
          setMarketplaceBadges(
            (w.marketplaceBadges || []).map((x: any) => ({
              platform: x.platform || "",
              badge: x.badge || "",
              url: x.url || "",
            })),
          );
          setEducation(
            (w.education || []).map((x: any) => ({
              degree: x.degree || "",
              institute: x.institute || "",
              startDate: x.startDate || "",
              endDate: x.endDate || "",
              description: x.description || "",
            })),
          );
          setExperience(
            (w.experience || []).map((x: any) => ({
              role: x.role || "",
              company: x.company || "",
              startDate: x.startDate || "",
              endDate: x.endDate || "",
              description: x.description || "",
            })),
          );
          setLinkedProfiles(
            (w.linkedProfiles || []).map((x: any) => ({
              platform: x.platform || "",
              badge: x.badge || "",
              title: x.title || "",
              subtitle: x.subtitle || "",
              link: x.link || "",
            })),
          );
          setSelectedIds((w.workSamples || []).map((x: any) => x._id));
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workerId]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : null);
  };

  const toggleSample = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  /* ----- submit ----- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName", form.lastName);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("gender", form.gender);
      fd.append("language", form.language);
      fd.append("badge", form.badge);
      fd.append("category", form.category);
      fd.append("location", form.location);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("about", form.about);
      fd.append("skills", form.skills);
      fd.append("createdBy", form.createdBy);
      fd.append("status", form.status);
      fd.append("role", form.role);
      fd.append("marketplaceBadges", JSON.stringify(marketplaceBadges));
      fd.append("education", JSON.stringify(education));
      fd.append("experience", JSON.stringify(experience));
      fd.append("linkedProfiles", JSON.stringify(linkedProfiles));
      fd.append("workSamples", JSON.stringify(selectedIds));
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await fetch(
        workerId ? `/api/admin/workers/${workerId}` : "/api/admin/workers",
        {
          method: workerId ? "PUT" : "POST",
          body: fd,
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Something went wrong");

      router.push("/admin/workers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-6 text-sm text-slate-400">Loading...</div>;

  const skillChips = form.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const avatarSrc = avatarPreview || currentAvatar;

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/workers"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          ← Back to sellers
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">
          {isEdit ? "Edit Seller" : "Add Seller"}
        </h1>
        {/* {isEdit && stats && (
          <p className="text-xs text-slate-500 mt-1">
            Rating: <span className="font-semibold text-slate-700">★ {stats.rating.toFixed(1)}</span> ({stats.reviewsCount}{' '}
            reviews) — reviews theke auto calculate hoy, ekhane edit kora jay na.
          </p>
        )} */}
      </div>

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Section title="Basic Information">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <label className={labelCls}>Photo</label>
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow-md flex items-center justify-center text-slate-400 text-3xl font-bold">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (form.firstName.charAt(0) || "?").toUpperCase()
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatar}
                className="mt-3 w-40 text-[11px] file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:text-[11px] file:font-semibold file:cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                JPG, PNG, WEBP, GIF • max 5MB
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2  gap-4">
              <Field label="First Name *">
                <input
                  required
                  value={form.firstName}
                  onChange={onField("firstName")}
                  placeholder="e.g. Thomas "
                  className={inputCls}
                />
              </Field>

              <Field label="Last Name *">
                <input
                  required
                  value={form.lastName}
                  onChange={onField("lastName")}
                  placeholder="e.g. Deo "
                  className={inputCls}
                />
              </Field>

              <Field label="Email *">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={onField("email")}
                  placeholder="example@example.com"
                  className={inputCls}
                />
              </Field>

              <div className="relative">
                <Field label={isEdit ? "New Password" : "Password *"}>
                  <input
                    required={!isEdit}
                    value={form.password}
                    onChange={onField("password")}
                    placeholder={
                      isEdit
                        ? "Leave empty to keep current password"
                        : "Enter password"
                    }
                    className={inputCls}
                    type={showpassword ? "text" : "password"}
                  />
                </Field>
                <span
                  className="cursor-pointer top-9 right-3 absolute"
                  onClick={() => setShowPassword(!showpassword)}
                >
                  {showpassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </span>
              </div>

              <Field label="Gender">
                <select
                  value={form.gender}
                  onChange={onField("gender")}
                  className={inputCls}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>

              <Field label="Language">
                <select
                  value={form.language}
                  onChange={onField("language")}
                  className={inputCls}
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Spanish">Spanish</option>
                </select>
              </Field>

              <Field label="Badge">
                <select
                  value={form.badge}
                  onChange={onField("badge")}
                  className={inputCls}
                >
                  <option value="">Select badge</option>
                  <option value="Level 1 Seller">Level 1 Seller</option>
                  <option value="Level 2 Seller">Level 2 Seller</option>
                  <option value="Level 3 Seller">Level 3 Seller</option>
                  <option value="Pro Seller">Pro Seller</option>
                </select>
              </Field>

              <Field label="Category *">
                <select
                  required
                  value={form.category}
                  onChange={onField("category")}
                  className={inputCls}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No categories found. Create one first.
                  </p>
                )}
              </Field>

              <Field label="Location">
                <input
                  value={form.location}
                  onChange={onField("location")}
                  placeholder="e.g. Los Angeles"
                  className={inputCls}
                />
              </Field>

              <Field label="Date of Birth">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={onField("dateOfBirth")}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Marketplace badges */}
        <Section
          title="Marketplace Badges"
          hint="e.g. Upwork • Top Rated Plus + profile URL."
        >
          <Repeater<MarketplaceBadge>
            items={marketplaceBadges}
            onChange={setMarketplaceBadges}
            makeEmpty={() => ({ platform: "", badge: "", url: "" })}
            addLabel="Add Marketplace Badge"
            itemLabel="Badge"
          >
            {(item, patch) => (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Platform *">
                  <input
                    value={item.platform}
                    onChange={(e) => patch({ platform: e.target.value })}
                    placeholder="Upwork"
                    className={inputCls}
                  />
                </Field>
                <Field label="Badge">
                  <input
                    value={item.badge}
                    onChange={(e) => patch({ badge: e.target.value })}
                    placeholder="Top Rated Plus"
                    className={inputCls}
                  />
                </Field>
                <Field label="Profile URL *">
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) => patch({ url: e.target.value })}
                    placeholder="https://www.upwork.com/freelancers/..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* Linked profiles */}
        <Section
          title="Linked Profiles"
          hint="Sidebar Upwork / Fiverr Linked Profile"
        >
          <Repeater<LinkedProfile>
            items={linkedProfiles}
            onChange={setLinkedProfiles}
            makeEmpty={() => ({
              platform: "",
              badge: "",
              title: "",
              subtitle: "",
              link: "",
            })}
            addLabel="Add Linked Profile"
            itemLabel="Profile"
          >
            {(item, patch) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Platform Name *">
                  <input
                    value={item.platform}
                    onChange={(e) => patch({ platform: e.target.value })}
                    placeholder="Upwork"
                    className={inputCls}
                  />
                </Field>
                <Field label="Badge">
                  <input
                    value={item.badge}
                    onChange={(e) => patch({ badge: e.target.value })}
                    placeholder="Top Rated Plus"
                    className={inputCls}
                  />
                </Field>
                <Field label="Title">
                  <input
                    value={item.title}
                    onChange={(e) => patch({ title: e.target.value })}
                    placeholder="100% Job Success"
                    className={inputCls}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    value={item.subtitle}
                    onChange={(e) => patch({ subtitle: e.target.value })}
                    placeholder="$100k+ Earned • 84 Projects Completed"
                    className={inputCls}
                  />
                </Field>
                <Field label="Link *" className="sm:col-span-2">
                  <input
                    type="url"
                    value={item.link}
                    onChange={(e) => patch({ link: e.target.value })}
                    placeholder="https://www.upwork.com/freelancers/..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* About */}
        <Section title="About Freelancer">
          <textarea
            rows={6}
            value={form.about}
            onChange={onField("about")}
            placeholder="Write about this freelancer..."
            className={inputCls}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {form.about.length}/5000
          </p>
        </Section>

        {/* Skills */}
        <Section title="Skills" hint="Comma separated.">
          <input
            value={form.skills}
            onChange={onField("skills")}
            placeholder="Creative, Figma, Prototyping"
            className={inputCls}
          />
          {skillChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skillChips.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF2EE] text-slate-800"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Work samples */}
        <Section title="Work Samples" hint="Available Samples">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>{selectedIds.length} selected</span>
            <Link
              href="/admin/work-sample"
              className="text-emerald-700 font-semibold hover:underline"
            >
              Manage work samples ↗
            </Link>
          </div>

          {available.length === 0 ? (
            <p className="text-xs text-slate-400">
              No available work samples. Create some from the Work Samples page.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {available.map((ws) => {
                const checked = selectedIds.includes(ws._id);
                const isVideo = ws.projectType === "video";
                return (
                  <button
                    key={ws._id}
                    type="button"
                    onClick={() => toggleSample(ws._id)}
                    className={`flex items-stretch gap-3 text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                      checked
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      {isVideo ? (
                        <video
                          src={`${ws.preview}#t=0.1`}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={ws.preview}
                          alt={ws.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/90 text-slate-900">
                        {isVideo ? "VIDEO" : "DESIGN"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="text-sm font-bold text-slate-900 line-clamp-1">
                        {ws.title}
                      </div>
                      <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {ws.subTitle || "—"}
                      </div>
                    </div>
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] shrink-0 self-start ${
                        checked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Section>

        {/* Education */}
        <Section title="Education">
          <Repeater<Education>
            items={education}
            onChange={setEducation}
            makeEmpty={() => ({
              degree: "",
              institute: "",
              startDate: "",
              endDate: "",
              description: "",
            })}
            addLabel="Add Education"
            itemLabel="Education"
          >
            {(item, patch) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Degree *">
                  <input
                    value={item.degree}
                    onChange={(e) => patch({ degree: e.target.value })}
                    placeholder="Bachelors in Fine Arts"
                    className={inputCls}
                  />
                </Field>
                <Field label="Institute *">
                  <input
                    value={item.institute}
                    onChange={(e) => patch({ institute: e.target.value })}
                    placeholder="Modern College"
                    className={inputCls}
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="month"
                    value={item.startDate}
                    onChange={(e) => patch({ startDate: e.target.value })}
                    placeholder="YYYY-MM"
                    className={inputCls}
                  />
                </Field>
                <Field label="End Date (empty = ongoing)">
                  <input
                    type="month"
                    value={item.endDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                    placeholder="YYYY-MM"
                    className={inputCls}
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* Experience */}
        <Section title="Work & Experience">
          <Repeater<Experience>
            items={experience}
            onChange={setExperience}
            makeEmpty={() => ({
              role: "",
              company: "",
              startDate: "",
              endDate: "",
              description: "",
            })}
            addLabel="Add Experience"
            itemLabel="Experience"
          >
            {(item, patch) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Job Role *">
                  <input
                    value={item.role}
                    onChange={(e) => patch({ role: e.target.value })}
                    placeholder="Product Designer"
                    className={inputCls}
                  />
                </Field>
                <Field label="Company Name *">
                  <input
                    value={item.company}
                    onChange={(e) => patch({ company: e.target.value })}
                    placeholder="AB Company"
                    className={inputCls}
                  />
                </Field>
                <Field label="Start Date">
                  <input
                    type="month"
                    value={item.startDate}
                    onChange={(e) => patch({ startDate: e.target.value })}
                    placeholder="YYYY-MM"
                    className={inputCls}
                  />
                </Field>
                <Field label="End Date (empty = present)">
                  <input
                    type="month"
                    value={item.endDate}
                    onChange={(e) => patch({ endDate: e.target.value })}
                    placeholder="YYYY-MM"
                    className={inputCls}
                  />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-10">
          <Link
            href="/admin/workers"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {saving ? "Saving..." : isEdit ? "Update Seller" : "Create Seller"}
          </button>
        </div>
      </form>
    </div>
  );
}
