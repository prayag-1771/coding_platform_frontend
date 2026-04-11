const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function parseTrustedOrigins() {
  const raw = process.env.CSRF_TRUSTED_ORIGINS ?? "";

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getRequestHost(req) {
  return (
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    ""
  );
}

function getAppBaseHost() {
  const baseUrl = process.env.APP_BASE_URL;

  if (!baseUrl) {
    return "";
  }

  try {
    return new URL(baseUrl).host;
  } catch {
    return "";
  }
}

export function getCsrfError(req) {
  const method = req.method?.toUpperCase() ?? "";

  if (SAFE_METHODS.has(method)) {
    return null;
  }

  const origin = req.headers.get("origin");

  if (!origin) {
    return "Missing origin header";
  }

  let originHost = "";

  try {
    originHost = new URL(origin).host;
  } catch {
    return "Invalid origin header";
  }

  const requestHost = getRequestHost(req);
  const appBaseHost = getAppBaseHost();

  if (requestHost && originHost === requestHost) {
    return null;
  }

  if (appBaseHost && originHost === appBaseHost) {
    return null;
  }

  const trustedOrigins = parseTrustedOrigins();

  if (trustedOrigins.includes(origin)) {
    return null;
  }

  return "Invalid CSRF origin";
}
