// Schrödinger token: lives in memory only until the participant confirms
// "I've written it down" — then and only then does it move to localStorage.
// Every subsequent page load reads from localStorage.

const LS_KEY = "a1c_token";
let _pending: string | null = null;

export function setPendingToken(t: string): void {
  _pending = t;
}

export function getPendingToken(): string | null {
  return _pending;
}

export function persistToken(): void {
  if (_pending && typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, _pending);
    _pending = null;
  }
}

export function getToken(): string | null {
  if (_pending) return _pending;
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LS_KEY);
}

export function clearToken(): void {
  _pending = null;
  if (typeof window !== "undefined") localStorage.removeItem(LS_KEY);
}
