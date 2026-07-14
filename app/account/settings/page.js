"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../components/auth/AuthProvider";
import { updateProfileAction, changePasswordAction } from "@/app/actions/account";

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setProfileSaved(false);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    await updateProfileAction(profile);
    setProfileSaved(true);
    router.refresh();
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordSaved(false);
    setPasswordError("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    const result = await changePasswordAction(passwordForm.currentPassword, passwordForm.newPassword);
    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }
    setPasswordSaved(true);
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink-900">Profile Details</h2>
        <form onSubmit={handleProfileSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink-800">Full Name</label>
            <input
              name="name"
              required
              value={profile.name}
              onChange={handleProfileChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Email</label>
            <input
              name="email"
              type="email"
              required
              value={profile.email}
              onChange={handleProfileChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Phone</label>
            <input
              name="phone"
              required
              value={profile.phone}
              onChange={handleProfileChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            {profileSaved && <p className="mb-3 text-sm text-success">Profile updated.</p>}
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink-900">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-800">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-800">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-800">Confirm New Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {passwordError && <p className="text-sm text-danger">{passwordError}</p>}
          {passwordSaved && <p className="text-sm text-success">Password updated.</p>}

          <Button type="submit">Update Password</Button>
        </form>
      </Card>
    </div>
  );
}
