import { createContext, useCallback, useContext, useEffect, useState } from "react";

const DataContext = createContext(null);

const VIEW_OPTIONS = ["This week", "This month", "All time"];
const VIEW_PARAM_MAP = {
  "This week": "week",
  "This month": "month",
  "All time": "all",
};

export function DataProvider({ children }) {
  // LEADERBOARD STATE
  const [leaderboardView, setLeaderboardViewState] = useState("All time");
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);

  // PROFILE STATE
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // ---- PROFILE ----
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "GET",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.profile) setProfile(data.profile);
      if (data.settings) setSettings(data.settings);
    } catch (err) {
      console.error("Failed to load profile", err);
      setProfileError("Could not load profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [baseUrl]);

  const saveProfile = useCallback(
    async ({ profile: profilePayload, settings: settingsPayload }) => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: profilePayload,
          settings: settingsPayload,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      if (updated.profile) setProfile(updated.profile);
      if (updated.settings) setSettings(updated.settings);
      return updated;
    },
    [baseUrl]
  );

  // ---- LEADERBOARD ----
  const mapLeaderboardUsers = (data) =>
    (data.users ?? []).map((u) => ({
      userId: u.id,
      displayName:
        u.name && u.name.trim().length > 0
          ? u.name
          : u.email
          ? u.email.split("@")[0]
          : "Anonymous",
      weeklyPoints: u.weeklyPoints ?? 0,
      totalCo2Saved: u.totalCarbonSavedKg ?? 0,
      streakDays: u.streakDays ?? 0,
      rank: u.rank ?? null,
      isCurrentUser: u.isCurrentUser ?? false,
    }));

  const loadLeaderboard = useCallback(
    async (viewLabel) => {
      const view = viewLabel || leaderboardView;
      const viewParam = VIEW_PARAM_MAP[view] || "week";

      setLeaderboardLoading(true);
      setLeaderboardError(null);

      try {
        const res = await fetch(
          `${baseUrl}/api/leaderboard?view=${viewParam}&limit=50&offset=0`,
          { method: "GET" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setLeaderboardUsers(mapLeaderboardUsers(data));
        setLeaderboardViewState(view);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setLeaderboardError("Could not load leaderboard. Please try again later.");
      } finally {
        setLeaderboardLoading(false);
      }
    },
    [baseUrl, leaderboardView]
  );

  // ---- INITIAL LOAD (once, at app start) ----
  useEffect(() => {
    loadProfile();
    loadLeaderboard("All time");
  }, [loadProfile, loadLeaderboard]);

  const value = {
    // Profile data + actions
    profile,
    settings,
    profileLoading,
    profileError,
    refreshProfile: loadProfile,
    saveProfile,

    // Leaderboard data + actions
    leaderboardUsers,
    leaderboardLoading,
    leaderboardError,
    leaderboardView,
    setLeaderboardView: (viewLabel) => {
      // change view and reload from API
      loadLeaderboard(viewLabel);
    },
    refreshLeaderboard: () => loadLeaderboard(),

    viewOptions: VIEW_OPTIONS,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside a DataProvider");
  }
  return ctx;
}
