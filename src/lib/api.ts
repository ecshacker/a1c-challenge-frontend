import { getToken } from "./token";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    public error: string,
    public details?: Record<string, string>,
  ) {
    super(error);
  }
}

async function publicRequest(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { method: "GET", headers: { "Content-Type": "application/json" } });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Request failed", data.details);
  return data;
}

async function request(method: string, path: string, body?: unknown): Promise<unknown> {
  const isEnroll = method === "POST" && path === "/participants/enroll";
  const token = getToken();

  if (!isEnroll && !token) {
    throw new ApiError(401, "NO_TOKEN");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!isEnroll && token) headers["X-Participant-Token"] = token;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "Request failed", data.details);
  }

  return data;
}

export const api = {
  get:       (path: string)                 => request("GET",   path),
  post:      (path: string, body?: unknown) => request("POST",  path, body),
  patch:     (path: string, body?: unknown) => request("PATCH", path, body),
  publicGet: (path: string)                 => publicRequest(path),
};

export interface ParticipantSelf {
  startDate:                    string | null;
  studyWeek:                    number | null;
  baselineEditable:             boolean;
  baselineA1c:                  number;
  baselineA1cTestType:          string;
  baselineA1cMonth:             number;
  baselineA1cYear:              number;
  baselineFructosamine:         number | null;
  baselineFructosamineTestType: string | null;
  weightValue:                  number | null;
  weightUnit:                   string | null;
  heightValue:                  number | null;
  heightUnit:                   string | null;
  glucoseMonitoringType:        string | null;
}
