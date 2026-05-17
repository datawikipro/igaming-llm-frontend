export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  const url = `${BACKEND_URL}${path}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.error(`API Error: Fetch failed with status ${res.status} for ${url}`);
      return null;
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json() as T;
    }
    return {} as T;
  } catch (e) {
    console.error(`API Network Error for ${url}:`, e);
    return null;
  }
}
