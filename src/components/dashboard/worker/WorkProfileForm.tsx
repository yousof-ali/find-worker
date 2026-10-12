"use client";

import { useAuth } from "@/providers/AuthProvider";
import React, {
  useEffect,
  useRef,
  useState,
} from "react";



type Category = {
  _id: string;
  name: string;
};

type MarketplaceBadge = {
  platform: string;
  badge: string;
  url: string;
};

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

type FormState = {
  gender: string;
  language: string;
  badge: string;
  category: string;
  location: string;
  dateOfBirth: string;
  about: string;
  skills: string;

  marketplaceBadges: MarketplaceBadge[];
  education: Education[];
  experience: Experience[];
  linkedProfiles: LinkedProfile[];
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500";

const labelCls =
  "block text-xs font-semibold text-slate-700 mb-1.5";

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
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        {hint && (
          <p className="text-xs text-slate-500 mt-0.5">
            {hint}
          </p>
        )}
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
  children: (
    item: T,
    patch: (value: Partial<T>) => void,
  ) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-slate-400">
          Nothing added yet.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              {itemLabel} #{index + 1}
            </span>

            <button
              type="button"
              onClick={() =>
                onChange(
                  items.filter(
                    (_, itemIndex) =>
                      itemIndex !== index,
                  ),
                )
              }
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Remove ✕
            </button>
          </div>

          {children(item, (patch) =>
            onChange(
              items.map((current, itemIndex) =>
                itemIndex === index
                  ? { ...current, ...patch }
                  : current,
              ),
            ),
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange([...items, makeEmpty()])
        }
        className="px-3.5 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
      >
        + {addLabel}
      </button>
    </div>
  );
}

const emptyForm: FormState = {
  gender: "",
  language: "",
  badge: "",
  category: "",
  location: "",
  dateOfBirth: "",
  about: "",
  skills: "",
  marketplaceBadges: [],
  education: [],
  experience: [],
  linkedProfiles: [],
};

export default function WorkerProfileForm() {
  const { user, refresh } = useAuth();

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const initialData = useRef("");

  const onField =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement |
          HTMLTextAreaElement |
          HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));

      setSuccess("");
    };

  // -------------------------------
  // Load categories
  // -------------------------------

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(
          "/api/categories",
          {
            cache: "no-store",
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to load categories",
          );
        }

        setCategories(
          Array.isArray(data)
            ? data
            : data.categories || [],
        );
      } catch (err: any) {
        setError(
          err.message ||
            "Failed to load categories",
        );
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  // -------------------------------
  // Fill worker data from useAuth
  // -------------------------------

  useEffect(() => {
    if (!user?.worker) {
      setLoading(false);
      return;
    }

    const worker = user.worker;

    const nextForm: FormState = {
      gender: worker.gender || "",
      language: worker.language || "",
      badge: worker.badge || "",

      category:
        typeof worker.category === "string"
          ? worker.category
          : worker.category?._id || "",

      location: worker.location || "",

      dateOfBirth: worker.dateOfBirth
        ? String(worker.dateOfBirth).slice(0, 10)
        : "",

      about: worker.about || "",

      skills: (worker.skills || []).join(", "),

      marketplaceBadges:
        worker.marketplaceBadges || [],

      education:
        worker.education || [],

      experience:
        worker.experience || [],

      linkedProfiles:
        worker.linkedProfiles || [],
    };

    setForm(nextForm);

    initialData.current =
      JSON.stringify(nextForm);

    setLoading(false);
  }, [user]);

  // -------------------------------
  // Dirty check
  // -------------------------------

  const currentData = JSON.stringify(form);

  const isDirty =
    initialData.current !== currentData;

  // -------------------------------
  // Submit
  // -------------------------------

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!isDirty || saving) return;

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        gender: form.gender.trim(),

        language: form.language.trim(),

        badge: form.badge.trim(),

        // এখানে Category ID যাবে
        category: form.category,

        location: form.location.trim(),

        dateOfBirth:
          form.dateOfBirth || null,

        about: form.about.trim(),

        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        marketplaceBadges:
          form.marketplaceBadges,

        education:
          form.education,

        experience:
          form.experience,

        linkedProfiles:
          form.linkedProfiles,
      };

      const res = await fetch(
        "/api/worker/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update profile",
        );
      }

      // AuthProvider এর worker data update হবে
      await refresh();

      setSuccess(
        "Your profile has been updated successfully.",
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!user?.worker) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Worker profile not found.
        </div>
      </div>
    );
  }

  const skillChips = form.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  return (
    <div className="mt-8">
      {/* Header */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Edit Profile
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Update your professional information.
        </p>
      </div>

      {/* Messages */}

      {error && (
        <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Worker Information */}

        <Section title="Professional Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={onField("gender")}
                className={inputCls}
              >
                <option value="">
                  Select Gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </Field>

            <Field label="Language">
              <select
                value={form.language}
                onChange={onField("language")}
                className={inputCls}
              >
                <option value="">
                  Select Language
                </option>

                <option value="English">
                  English
                </option>

                <option value="Chinese">
                  Chinese
                </option>

                <option value="French">
                  French
                </option>

                <option value="German">
                  German
                </option>

                <option value="Spanish">
                  Spanish
                </option>
              </select>
            </Field>

            <Field label="Badge">
              <select
                value={form.badge}
                onChange={onField("badge")}
                className={inputCls}
              >
                <option value="">
                  Select Badge
                </option>

                <option value="Level 1 Seller">
                  Level 1 Seller
                </option>

                <option value="Level 2 Seller">
                  Level 2 Seller
                </option>

                <option value="Level 3 Seller">
                  Level 3 Seller
                </option>

                <option value="Pro Seller">
                  Pro Seller
                </option>
              </select>
            </Field>

            <Field label="Category *">
              <select
                required
                value={form.category}
                onChange={onField("category")}
                disabled={categoryLoading}
                className={`${inputCls} disabled:opacity-60`}
              >
                <option value="">
                  {categoryLoading
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Location">
              <input
                value={form.location}
                onChange={onField("location")}
                placeholder="e.g. Dhaka, Bangladesh"
                className={inputCls}
              />
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dateOfBirth}
                max={
                  new Date()
                    .toISOString()
                    .slice(0, 10)
                }
                onChange={onField("dateOfBirth")}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Marketplace Badges */}

        <Section
          title="Marketplace Badges"
          hint="e.g. Upwork • Top Rated Plus"
        >
          <Repeater<MarketplaceBadge>
            items={form.marketplaceBadges}
            onChange={(items) =>
              setForm((prev) => ({
                ...prev,
                marketplaceBadges: items,
              }))
            }
            makeEmpty={() => ({
              platform: "",
              badge: "",
              url: "",
            })}
            addLabel="Add Marketplace Badge"
            itemLabel="Badge"
          >
            {(item, patch) => (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Platform *">
                  <input
                    value={item.platform}
                    onChange={(e) =>
                      patch({
                        platform:
                          e.target.value,
                      })
                    }
                    placeholder="Upwork"
                    className={inputCls}
                  />
                </Field>

                <Field label="Badge">
                  <input
                    value={item.badge}
                    onChange={(e) =>
                      patch({
                        badge:
                          e.target.value,
                      })
                    }
                    placeholder="Top Rated Plus"
                    className={inputCls}
                  />
                </Field>

                <Field label="Profile URL *">
                  <input
                    type="url"
                    value={item.url}
                    onChange={(e) =>
                      patch({
                        url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* Linked Profiles */}

        <Section
          title="Linked Profiles"
          hint="Upwork / Fiverr / other marketplace profiles"
        >
          <Repeater<LinkedProfile>
            items={form.linkedProfiles}
            onChange={(items) =>
              setForm((prev) => ({
                ...prev,
                linkedProfiles: items,
              }))
            }
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
                    onChange={(e) =>
                      patch({
                        platform:
                          e.target.value,
                      })
                    }
                    placeholder="Upwork"
                    className={inputCls}
                  />
                </Field>

                <Field label="Badge">
                  <input
                    value={item.badge}
                    onChange={(e) =>
                      patch({
                        badge:
                          e.target.value,
                      })
                    }
                    placeholder="Top Rated Plus"
                    className={inputCls}
                  />
                </Field>

                <Field label="Title">
                  <input
                    value={item.title}
                    onChange={(e) =>
                      patch({
                        title:
                          e.target.value,
                      })
                    }
                    placeholder="100% Job Success"
                    className={inputCls}
                  />
                </Field>

                <Field label="Subtitle">
                  <input
                    value={item.subtitle}
                    onChange={(e) =>
                      patch({
                        subtitle:
                          e.target.value,
                      })
                    }
                    placeholder="$100k+ Earned"
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Link *"
                  className="sm:col-span-2"
                >
                  <input
                    type="url"
                    value={item.link}
                    onChange={(e) =>
                      patch({
                        link:
                          e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* About */}

        <Section title="About">
          <textarea
            rows={6}
            value={form.about}
            onChange={onField("about")}
            maxLength={5000}
            placeholder="Write about yourself..."
            className={inputCls}
          />

          <p className="text-[11px] text-slate-400 mt-1">
            {form.about.length}/5000
          </p>
        </Section>

        {/* Skills */}

        <Section
          title="Skills"
          hint="Comma separated"
        >
          <input
            value={form.skills}
            onChange={onField("skills")}
            placeholder="React, Next.js, Node.js"
            className={inputCls}
          />

          {skillChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skillChips.map(
                (skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700"
                  >
                    {skill}
                  </span>
                ),
              )}
            </div>
          )}
        </Section>

        {/* Education */}

        <Section title="Education">
          <Repeater<Education>
            items={form.education}
            onChange={(items) =>
              setForm((prev) => ({
                ...prev,
                education: items,
              }))
            }
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
                    onChange={(e) =>
                      patch({
                        degree:
                          e.target.value,
                      })
                    }
                    placeholder="Bachelors in Computer Science"
                    className={inputCls}
                  />
                </Field>

                <Field label="Institute *">
                  <input
                    value={item.institute}
                    onChange={(e) =>
                      patch({
                        institute:
                          e.target.value,
                      })
                    }
                    placeholder="University Name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Start Date">
                  <input
                    type="month"
                    value={item.startDate}
                    onChange={(e) =>
                      patch({
                        startDate:
                          e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>

                <Field label="End Date">
                  <input
                    type="month"
                    value={item.endDate}
                    onChange={(e) =>
                      patch({
                        endDate:
                          e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Description"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) =>
                      patch({
                        description:
                          e.target.value,
                      })
                    }
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
            items={form.experience}
            onChange={(items) =>
              setForm((prev) => ({
                ...prev,
                experience: items,
              }))
            }
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
                    onChange={(e) =>
                      patch({
                        role:
                          e.target.value,
                      })
                    }
                    placeholder="Frontend Developer"
                    className={inputCls}
                  />
                </Field>

                <Field label="Company Name *">
                  <input
                    value={item.company}
                    onChange={(e) =>
                      patch({
                        company:
                          e.target.value,
                      })
                    }
                    placeholder="Company Name"
                    className={inputCls}
                  />
                </Field>

                <Field label="Start Date">
                  <input
                    type="month"
                    value={item.startDate}
                    onChange={(e) =>
                      patch({
                        startDate:
                          e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>

                <Field label="End Date">
                  <input
                    type="month"
                    value={item.endDate}
                    onChange={(e) =>
                      patch({
                        endDate:
                          e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>

                <Field
                  label="Description"
                  className="sm:col-span-2"
                >
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) =>
                      patch({
                        description:
                          e.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </Repeater>
        </Section>

        {/* Actions */}

        <div className="flex items-center justify-end gap-3 pt-2 pb-10">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            {saving
              ? "Updating..."
              : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}