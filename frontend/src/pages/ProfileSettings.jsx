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
  theme: "dark",
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setLocalProfile({
        name: profile.name ?? "",
        email: profile.email ?? "",
        role: profile.role ?? "",
        organization: profile.organization ?? "",
        bio: profile.bio ?? "",
      });
    }

    if (settings) {
      setLocalSettings({
        theme: settings.theme ?? "dark",
        emailNotifications:
          settings.emailNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        newsletter: settings.newsletter ?? true,
        language: settings.language ?? "en",
      });
    }
  }, [profile, settings]);

  const handleProfileChange = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setLocalProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    if (!isEditing) return;
    const { name, type, checked } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : prev[name],
    }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setStatusMessage("");
  };

  const handleCancel = () => {
    if (profile) {
      setLocalProfile({
        name: profile.name ?? "",
        email: profile.email ?? "",
        role: profile.role ?? "",
        organization: profile.organization ?? "",
        bio: profile.bio ?? "",
      });
    } else {
      setLocalProfile(EMPTY_PROFILE);
    }

    if (settings) {
      setLocalSettings({
        theme: settings.theme ?? "dark",
        emailNotifications:
          settings.emailNotifications ?? true,
        smsNotifications: settings.smsNotifications ?? false,
        newsletter: settings.newsletter ?? true,
        language: settings.language ?? "en",
      });
    } else {
      setLocalSettings(EMPTY_SETTINGS);
    }

    setIsEditing(false);
    setStatusMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    try {
      setStatusMessage("Saving…");
      await saveProfile({
        profile: localProfile,
        settings: localSettings,
      });
      setStatusMessage("Profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile", err);
      setStatusMessage("Failed to save profile.");
    }
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
          <div className="profile-card-header">
            <h2>Profile</h2>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={localProfile.name}
              onChange={handleProfileChange}
              type="text"
              required
              readOnly={!isEditing}
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
              readOnly={!isEditing}
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
                readOnly={!isEditing}
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
                readOnly={!isEditing}
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
              readOnly={!isEditing}
            />
          </div>
        </section>

        {/* Right side – settings */}
        <section className="settings-card">
          <div className="settings-card-header">
            <h2>Preferences</h2>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEditClick}
              >
                Edit profile
              </button>
            )}
          </div>

          {/* Theme & language are not editable in the UI */}

          <fieldset className="settings-group">
            <legend>Notifications</legend>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={localSettings.emailNotifications}
                onChange={handleSettingsChange}
                disabled={!isEditing}
              />
              <span>Email notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="smsNotifications"
                checked={localSettings.smsNotifications}
                onChange={handleSettingsChange}
                disabled={!isEditing}
              />
              <span>SMS notifications</span>
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                name="newsletter"
                checked={localSettings.newsletter}
                onChange={handleSettingsChange}
                disabled={!isEditing}
              />
              <span>Product updates &amp; newsletter</span>
            </label>
          </fieldset>

          <div className="form-actions">
            {isEditing && (
              <>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  Save changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
