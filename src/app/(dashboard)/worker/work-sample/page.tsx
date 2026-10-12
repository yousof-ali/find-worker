"use client";

import { useEffect, useState, type FormEvent } from "react";

interface WorkSample {
  _id: string;
  title: string;
  subTitle: string;
  clientName: string;
  deliveryDate: string;
  projectType: "design" | "video";
  preview: string;
  tools: string[];
  canSelect: boolean;
  selected: boolean;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export default function WorkerWorkSamplesPage() {
  const [samples, setSamples] = useState<WorkSample[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSamples = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/worker/work-samples", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load work samples");
      const items: WorkSample[] = data.workSamples || [];
      setSamples(items);
      setSelectedIds(
        items.filter((sample) => sample.canSelect && sample.selected).map((sample) => sample._id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load work samples");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSamples();
  }, []);

  const createSample = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/worker/work-samples", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create work sample");
      form.reset();
      setMessage("Work sample created. Select it below to show it on your profile.");
      await loadSamples();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create work sample");
    } finally {
      setCreating(false);
    }
  };

  const saveSelection = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/worker/work-samples", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sampleIds: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update profile samples");
      setMessage("Your profile work samples have been updated.");
      await loadSamples();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile samples");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Work Samples</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add your own projects, then choose which samples appear on your public profile.
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      <form onSubmit={createSample} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create a work sample</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Project title *
            <input name="title" required maxLength={150} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Client *
            <input name="clientName" required maxLength={120} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Subtitle
            <input name="subTitle" maxLength={200} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Tools (comma separated)
            <input name="tools" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Delivery date *
            <input name="deliveryDate" type="date" required className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Sample type *
            <select name="projectType" required className={`${inputClass} mt-1`}>
              <option value="design">Design / image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Preview file *
            <input
              name="preview"
              type="file"
              accept="image/*,video/*"
              required
              className={`${inputClass} mt-1`}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Work Sample"}
        </button>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Select profile samples</h2>
            <p className="text-sm text-slate-500">Only work samples you created can be selected here.</p>
          </div>
          <button
            type="button"
            onClick={saveSelection}
            disabled={saving || loading}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Selection"}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Loading work samples...</p>
        ) : samples.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
            You have not created any work samples yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {samples.map((sample) => (
              <label
                key={sample._id}
                className={`flex gap-3 rounded-xl border p-3 ${
                  sample.canSelect ? "cursor-pointer border-slate-200" : "border-slate-100 bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={sample.canSelect && selectedIds.includes(sample._id)}
                  disabled={!sample.canSelect}
                  onChange={() =>
                    setSelectedIds((current) =>
                      current.includes(sample._id)
                        ? current.filter((id) => id !== sample._id)
                        : [...current, sample._id],
                    )
                  }
                  className="mt-1 accent-emerald-600"
                />
                <span className="min-w-0 flex-1">
                  {sample.projectType === "video" ? (
                    <video src={sample.preview} className="mb-3 h-36 w-full rounded-lg bg-black object-cover" controls />
                  ) : (
                    <img src={sample.preview} alt={sample.title} className="mb-3 h-36 w-full rounded-lg object-cover" />
                  )}
                  <span className="block font-semibold text-slate-900">{sample.title}</span>
                  <span className="block text-xs text-slate-500">
                    {sample.clientName} · {new Date(sample.deliveryDate).toLocaleDateString()}
                  </span>
                  {!sample.canSelect && (
                    <span className="mt-1 block text-xs text-slate-500">
                      Added to your profile by an administrator
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
