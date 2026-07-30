import "server-only";

export type HealthResponse = {
  app: "Lynkroam";
  status: "ok";
  environment: string;
  timestamp: string;
};

function normalizeOrigin(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Health-check origins must use HTTP or HTTPS.");
  }

  if (url.username || url.password) {
    throw new Error("Health-check origins must not include credentials.");
  }

  return url.origin;
}

function resolveHealthOrigin() {
  const configuredOrigin = process.env.HEALTHCHECK_ORIGIN?.trim();

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  if (process.env.VERCEL_URL) {
    return normalizeOrigin(`https://${process.env.VERCEL_URL}`);
  }

  return normalizeOrigin(
    `http://localhost:${process.env.PORT?.trim() || "3000"}`,
  );
}

function isHealthResponse(value: unknown): value is HealthResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.app === "Lynkroam" &&
    candidate.status === "ok" &&
    typeof candidate.environment === "string" &&
    candidate.environment.length > 0 &&
    typeof candidate.timestamp === "string" &&
    !Number.isNaN(Date.parse(candidate.timestamp))
  );
}

export async function fetchHealth(): Promise<HealthResponse> {
  const headers = new Headers({
    Accept: "application/json",
  });
  const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

  if (bypassSecret) {
    headers.set("x-vercel-protection-bypass", bypassSecret);
  }

  const response = await fetch(`${resolveHealthOrigin()}/api/health`, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error("The internal health endpoint returned an error.");
  }

  const data: unknown = await response.json();

  if (!isHealthResponse(data)) {
    throw new Error("The internal health endpoint returned invalid data.");
  }

  return data;
}
