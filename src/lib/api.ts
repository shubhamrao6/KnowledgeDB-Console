const API_BASE = 'https://fgbpqt2pq6.execute-api.us-east-1.amazonaws.com/prod';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('kdb_refresh_token');
      if (!refreshToken) return false;
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('kdb_id_token', data.idToken);
        localStorage.setItem('kdb_access_token', data.accessToken);
        return true;
      }
      return false;
    } catch (_e) {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function doFetch<T>(
  method: string,
  path: string,
  body?: unknown,
  useAuth = true,
  isFormData = false
): Promise<{ status: number; data: T }> {
  const headers: Record<string, string> = {};

  if (useAuth && typeof window !== 'undefined') {
    const idToken = localStorage.getItem('kdb_id_token') || '';
    if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
    const apiKey = localStorage.getItem('kdb_api_key') || '';
    if (apiKey) headers['x-api-key'] = apiKey;
  }

  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts: RequestInit = { method, headers };
  if (body) {
    opts.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);
  let data: T;
  try { data = await res.json(); } catch (_e) { data = {} as T; }
  return { status: res.status, data };
}

export async function apiRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  useAuth = true,
  isFormData = false
): Promise<{ status: number; data: T }> {
  try {
    const result = await doFetch<T>(method, path, body, useAuth, isFormData);

    // Auto-refresh on 401 and retry once
    if (result.status === 401 && useAuth) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return doFetch<T>(method, path, body, useAuth, isFormData);
      }
    }

    return result;
  } catch (_e) {
    return { status: 0, data: { message: 'Network error. Please check your connection.' } as T };
  }
}

export { API_BASE };
