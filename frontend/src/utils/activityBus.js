const listeners = new Set();

export function emitActivity(payload) {
    try {
        listeners.forEach(fn => {
            try { fn(payload); } catch (e) { console.error("activityBus listener error", e); }
        });
    } catch (e) {
        console.error("emitActivity error", e);
    }
}

export function onActivity(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
}
