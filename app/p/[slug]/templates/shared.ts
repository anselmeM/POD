export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function getStoredTrackingParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const sessionData = sessionStorage.getItem("pod_tracking_params");
    if (sessionData) return JSON.parse(sessionData);
    const localData = localStorage.getItem("pod_tracking_params");
    if (localData) return JSON.parse(localData);
    return {};
  } catch {
    return {};
  }
}
