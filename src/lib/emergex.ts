/** Our booth page on emergeX. The part after the event name is the same every time, but the event name changes
 * (practice, mock-2, mock-3, finale), so set VITE_EMERGEX_BOOTH_URL to point at the current event. */
const DEFAULT_BOOTH = "https://emergex.dev/projects/f26-finale-25308b9e-22f0-472a-9d44-f084aa5f2379";

/** The emergeX booth link, or "" if the setting isn't a real emergeX project address (the button then hides). */
export function emergexBoothUrl(): string {
  const raw = import.meta.env.VITE_EMERGEX_BOOTH_URL || DEFAULT_BOOTH;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && u.hostname === "emergex.dev" && u.pathname.startsWith("/projects/") ? u.toString() : "";
  } catch {
    return "";
  }
}
