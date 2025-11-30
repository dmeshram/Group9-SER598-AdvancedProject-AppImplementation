// src/pages/ProfileSettings.jsx
import { useState, useEffect } from "react";

const initialProfile = {
  name: "Oscar Piastri",
  email: "oscar.piastri@example.com",
  role: "Driver",
  organization: "McLaren Racing",
  bio: "Deserve to win, forced to be second.",
};

const initialSettings = {
  theme: "light",
  emailNotifications: true,
  smsNotifications: false,
  newsletter: true,
  language: "en",
};

export default function ProfileSettings() {
  const [profile, setProfile] = useState(initialProfile);
  const [settings, setSettings] = useState(initialSettings);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const res = await fetch(`${baseUrl}/api/profile`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load profile", err);
        setError("Could not load profile. Using default values.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage("Saving…");

      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          settings,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = await res.json();
      if (updated.profile) setProfile(updated.profile);
      if (updated.settings) setSettings(updated.settings);

      setStatusMessage("Profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
      setStatusMessage("Failed to save profile.");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile &amp; Settings</h1>

      {loading && <div className="status-banner">Loading your profile…</div>}
      {error && (
        <div className="status-banner status-banner--error">{error}</div>
      )}
      {statusMessage && <div className="status-banner">{statusMessage}</div>}

      <form className="profile-layout" onSubmit={handleSubmit}>
        {/* Left side – profile info */}
        <section className="profile-card">
          <h2>Profile</h2>
          <p className="section-subtitle">Update your personal information.</p>

          <div className="avatar-circle">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </div>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              type="text"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              type="email"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                id="role"
                name="role"
                value={profile.role}
                onChange={handleProfileChange}
                type="text"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <input
                id="organization"
                name="organization"
                value={profile.organization}
                onChange={handleProfileChange}
                type="text"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              rows={4}
              placeholder="Tell us a bit about yourself…"
            />
          </div>
        </section>

        {/* Right side – settings */}
        <section className="settings-card">
          <h2>Account Settings</h2>
          <p className="section-subtitle">
            Manage how your account looks and behaves.
          </p>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleSettingsChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System default</option>
            </select>
          </div>

          <fieldset className="settings-group">
            <legend>Notifications</legend>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleSettingsChange}
              />
              <span>Email notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleSettingsChange}
              />
              <span>SMS notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="newsletter"
                checked={settings.newsletter}
                onChange={handleSettingsChange}
              />
              <span>Monthly sustainability newsletter</span>
            </label>
          </fieldset>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleSettingsChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <div className="actions-row">
            <button type="submit" className="primary-button">
              Save changes
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setProfile(initialProfile);
                setSettings(initialSettings);
                setStatusMessage("Reverted to last saved values.");
                setTimeout(() => setStatusMessage(""), 3000);
              }}
            >
              Reset
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
