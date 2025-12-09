const KEY = "pending_activities_v1";

export function getPendingActivities() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addPendingActivity(activity) {
  const existing = getPendingActivities();
  existing.push(activity);
  localStorage.setItem(KEY, JSON.stringify(existing));
}

export function clearPendingActivities() {
  localStorage.removeItem(KEY);
}

export function setPendingActivities(list) {
  localStorage.setItem(KEY, JSON.stringify(list || []));
}