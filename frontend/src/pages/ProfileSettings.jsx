import { useEffect, useState } from "react";
import { useAppData } from "../data/AppDataContext.jsx";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  role: "",
  organization: "",
  bio: "",
};

const EMPTY_SETTINGS = {
  theme: "light",
  emailNotifications: true,
  smsNotifications: false,
  newsletter: true,
  language: "en",
};

export default function ProfileSettings() {
  const {
    profile,
    settings,
    profileLoading,
    profileError,
    saveProfile,
  } = useAppData();

  const [localProfile, setLocalProfile] = useState(EMPTY_PROFILE);
  const [localSettings, setLocalSettings] = useState(EMPTY_SETTINGS);
  const [statusMessage, setStatusMessage] = useState("");

  // When global data finishes loading, copy it into local edit state
  useEffect(() => {
    if (profile) {
      setLocalProfile((prev) => ({ ...prev, ...profile }));
    }
    if (settings) {
      setLocalSettings((prev) => ({ ...prev, ...settings }));
    }
  }, [profile, settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatusMessage("Saving…");
      await saveProfile({
        profile: localProfile,
        settings: localSettings,
      });
      setStatusMessage("Profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
      setStatusMessage("Failed to save profile.");
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setLocalProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, type, value, checked } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile &amp; Settings</h1>

      {profileLoading && (
        <div className="status-banner">Loading your profile…</div>
      )}
      {profileError && (
        <div className="status-banner status-banner--error">
          {profileError}
        </div>
      )}
      {statusMessage && (
        <div className="status-banner">{statusMessage}</div>
      )}

      <form className="profile-layout" onSubmit={handleSubmit}>
        {/* Left side – profile info */}
        <section className="profile-card">
          <h2>Profile</h2>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={localProfile.name}
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
              value={localProfile.email}
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
                value={localProfile.role}
                onChange={handleProfileChange}
                type="text"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <input
                id="organization"
                name="organization"
                value={localProfile.organization}
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
              value={localProfile.bio}
              onChange={handleProfileChange}
              rows={4}
            />
          </div>
        </section>

        {/* Right side – settings */}
        <section className="settings-card">
          <h2>Preferences</h2>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={localSettings.theme}
              onChange={handleSettingsChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              name="language"
              value={localSettings.language}
              onChange={handleSettingsChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* add more as needed */}
            </select>
          </div>

          <fieldset className="settings-group">
            <legend>Notifications</legend>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={localSettings.emailNotifications}
                onChange={handleSettingsChange}
              />
              <span>Email notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={localSettings.smsNotifications}
                onChange={handleSettingsChange}
              />
              <span>SMS notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="newsletter"
                checked={localSettings.newsletter}
                onChange={handleSettingsChange}
              />
              <span>Product updates &amp; newsletter</span>
            </label>
          </fieldset>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={profileLoading}
            >
              Save changes
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
