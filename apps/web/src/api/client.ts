const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function apiFetch<T>(path: string, options?: FetchOptions): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers,
    credentials: 'include',
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export { apiFetch };
