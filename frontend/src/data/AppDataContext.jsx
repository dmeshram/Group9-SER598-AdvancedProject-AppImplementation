import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const DataContext = createContext(null);

const VIEW_OPTIONS = ["This week", "This month", "All time"];
const DEFAULT_VIEW = "All time";

function getViewKey(label) {
  switch (label) {
    case "This week":
      return "week";
    case "This month":
      return "month";
    case "All time":
    default:
      return "all";
  }
}

export function DataProvider({ children }) {
  const { token, user } = useAuth();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [leaderboardData, setLeaderboardData] = useState({
    week: [],
    month: [],
    all: [],
  });
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [leaderboardView, setLeaderboardViewState] = useState(DEFAULT_VIEW);

  const currentUserEmail =
    user && user.email ? user.email.toLowerCase() : null;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light");
    root.classList.add("theme-dark");
  }, []);

  const mapLeaderboardUsers = useCallback(
    (data) =>
      (data.users ?? []).map((u) => {
        const email = u.email ?? "";
        const emailLower = email.toLowerCase();
        const isCurrent =
          currentUserEmail && emailLower
            ? emailLower === currentUserEmail
            : false;

        return {
          userId: u.id,
          displayName:
            u.name && u.name.trim().length > 0
              ? u.name
              : email
              ? email.split("@")[0]
              : "Anonymous",
          email,
          weeklyPoints: u.weeklyPoints ?? 0,
          totalCo2Saved: u.totalCarbonSavedKg ?? 0,
          streakDays: u.streakDays ?? 0,
          completedGoals: u.completedGoals ?? 0,
          level: u.level ?? "",
          percentile: u.percentile ?? null,
          rank: u.rank ?? null,
          isCurrentUser: isCurrent,
        };
      }),
    [currentUserEmail]
  );

  const loadProfile = useCallback(async () => {
    if (!token) return;

    setProfileLoading(true);
    setProfileError(null);
    try {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  }, [baseUrl, token]);

  const saveProfile = useCallback(
    async ({ profile: profilePayload, settings: settingsPayload }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    [baseUrl, token]
  );

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setSettings(null);
      setLeaderboardData({ week: [], month: [], all: [] });
      setLeaderboardViewState(DEFAULT_VIEW);
      return;
    }

    loadProfile();

    const fetchView = async (viewKey) => {
      const url = `${baseUrl}/api/leaderboard?view=${viewKey}&limit=50&offset=0`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for view=${viewKey}`);
      const data = await res.json();
      return mapLeaderboardUsers(data);
    };

    const fetchAllViews = async () => {
      setLeaderboardLoading(true);
      setLeaderboardError(null);
      try {
        const [allUsers, weekUsers, monthUsers] = await Promise.all([
          fetchView("all"),
          fetchView("week"),
          fetchView("month"),
        ]);

        setLeaderboardData({
          all: allUsers,
          week: weekUsers,
          month: monthUsers,
        });
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setLeaderboardError(
          "Could not load leaderboard. Please try again later."
        );
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchAllViews();
  }, [token, baseUrl, loadProfile, mapLeaderboardUsers]);

  const currentViewKey = getViewKey(leaderboardView);
  const leaderboardUsers = leaderboardData[currentViewKey] ?? [];

  const refreshLeaderboard = useCallback(async () => {
    if (!token) return;

    const fetchView = async (viewKey) => {
      const url = `${baseUrl}/api/leaderboard?view=${viewKey}&limit=50&offset=0`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for view=${viewKey}`);
      const data = await res.json();
      return mapLeaderboardUsers(data);
    };

    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      const [allUsers, weekUsers, monthUsers] = await Promise.all([
        fetchView("all"),
        fetchView("week"),
        fetchView("month"),
      ]);

      setLeaderboardData({
        all: allUsers,
        week: weekUsers,
        month: monthUsers,
      });
    } catch (err) {
      console.error("Failed to refresh leaderboard", err);
      setLeaderboardError(
        "Could not refresh leaderboard. Please try again later."
      );
    } finally {
      setLeaderboardLoading(false);
    }
  }, [baseUrl, token, mapLeaderboardUsers]);

  const value = {
    profile,
    settings,
    profileLoading,
    profileError,
    refreshProfile: loadProfile,
    saveProfile,

    leaderboardUsers,
    leaderboardLoading,
    leaderboardError,
    leaderboardView,
    setLeaderboardView: (viewLabel) => {
      setLeaderboardViewState(viewLabel);
    },
    refreshLeaderboard,
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
