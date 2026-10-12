"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CiUser } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";

export default function ProfileMenu({
  menuEnabled = true,
}: {
  menuEnabled?: boolean;
}) {
  const { user, refresh, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [avatarFile]);

  if (!user) return null;

  const name = `${user.firstName} ${user.lastName}`.trim();
  const openProfile = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setPassword("");
    setAvatarFile(null);
    setError("");
    setSuccess("");
    setMenuOpen(false);
    setProfileOpen(true);
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      if (password) formData.append("password", password);
      if (avatarFile) formData.append("avatar", avatarFile);

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to update profile");

      await refresh();
      setSuccess("Profile updated successfully.");
      setAvatarFile(null);
      setPassword("");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="relative" ref={containerRef}>
        {menuEnabled ? (
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <CiUser className="text-2xl" />
            )}
          </button>
        ) : (
          <div
            aria-label={`${name} profile image`}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <CiUser className="text-2xl" />
            )}
          </div>
        )}

        {menuEnabled && menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={openProfile}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <CiUser size={18} />
              Profile
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={async () => {
                setLoggingOut(true);
                await logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              <IoIosLogOut size={18} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>

      {menuEnabled && profileOpen &&
        createPortal(
        <div
          className="fixed inset-0 z-[1000] flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfileOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 id="profile-modal-title" className="text-xl font-bold text-slate-900">
                  Edit profile
                </h2>
                <p className="mt-1 text-sm text-slate-500">Update your name and profile photo.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile dialog"
                className="rounded-lg px-2 py-1 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                  {avatarPreview || user.avatar ? (
                    <img
                      src={avatarPreview || user.avatar || ""}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CiUser className="text-4xl" />
                  )}
                </div>
                <label className="cursor-pointer text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  Change photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                First name
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  maxLength={50}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Last name
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  maxLength={50}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  readOnly={user.role !== "admin"}
                  required
                  className={`mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ${user.role !== "admin" ? "bg-slate-50 text-slate-500" : ""}`}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Leave blank to keep your current password"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Use at least 8 characters. Leave blank to keep your current password.
                </span>
              </label>

              {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
              {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
