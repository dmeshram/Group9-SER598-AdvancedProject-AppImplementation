
const ACTIVITY_EVENT = "app:activityLogged";

export function emitActivity(activity) {
    if (!activity || !activity.type) return;
    try {
        window.dispatchEvent(new CustomEvent(ACTIVITY_EVENT, { detail: activity }));
    } catch (e) {
        console.warn("emitActivity failed", e);
    }
}

export function onActivity(handler) {
    const wrapper = (e) => handler(e.detail);
    window.addEventListener(ACTIVITY_EVENT, wrapper);
    return () => window.removeEventListener(ACTIVITY_EVENT, wrapper);
}
