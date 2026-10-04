/**
 * Client for the Huntouse API (`~/Desktop/huntouse-api`). Every request carries the user's Clerk
 * session token; the server verifies it. The app never holds an API key.
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly body: unknown,
  ) {
    super(`API ${status}: ${code}`);
  }
}

/** Returns a fresh Clerk session token (`useAuth().getToken`). */
export type GetToken = () => Promise<string | null>;

export async function apiFetch<T>(
  getToken: GetToken,
  path: string,
  init: { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  if (!API_URL) throw new Error('Missing EXPO_PUBLIC_API_URL. Add it to .env.local.');
  const token = await getToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(init.body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      // Free ngrok tunnels otherwise answer with an HTML interstitial during development.
      ...(__DEV__ && { 'ngrok-skip-browser-warning': 'true' }),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const code =
      data && typeof data === 'object' && 'error' in data ? String(data.error) : 'request_failed';
    throw new ApiError(res.status, code, data);
  }
  return data as T;
}

export type Me = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  roles: ('seeker' | 'owner' | 'agent' | 'admin')[];
  status: 'active' | 'suspended' | 'deleted';
  profile: {
    countryCode: string | null;
    phoneCountryCode: string | null;
    phone: string | null;
    birthday: string | null;
    goals: string[];
    propertyTypes: string[];
    setupCompleted: boolean;
  } | null;
};
