const KEY = "hezo_publishing";

export function setPublishingState(siteId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, siteId);
}

export function getPublishingState(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function clearPublishingState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
