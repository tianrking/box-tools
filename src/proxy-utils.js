const DROP_REQUEST_HEADERS = new Set([
  "cf-connecting-ip",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "cf-worker",
  "x-forwarded-for",
  "x-real-ip",
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function corsPreflightResponse() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export function htmlResponse(html, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/html; charset=utf-8");
  return new Response(html, { ...init, headers });
}

export function textResponse(text, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(text, { ...init, headers });
}

export async function proxyRequest(request, targetUrl, options = {}) {
  const target = typeof targetUrl === "string" ? new URL(targetUrl) : targetUrl;
  const upstreamRequest = new Request(target.toString(), {
    method: request.method,
    headers: buildProxyRequestHeaders(request, target, options.headers),
    body: shouldForwardBody(request) ? await request.blob() : null,
    redirect: "manual",
  });

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = buildProxyResponseHeaders(upstreamResponse.headers);
  rewriteRedirectLocation(responseHeaders, upstreamResponse.status, target, options.redirectBaseUrl);

  if (options.cacheControl) {
    responseHeaders.set("Cache-Control", options.cacheControl);
  }

  responseHeaders.set("Access-Control-Allow-Origin", "*");
  responseHeaders.set("Access-Control-Expose-Headers", "*");

  if (options.transformText && (options.forceTextTransform || isTextLike(responseHeaders))) {
    const text = await upstreamResponse.text();
    const transformed = await options.transformText(text, responseHeaders, target);
    responseHeaders.delete("Content-Length");
    return new Response(transformed, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export function joinUrlPath(baseUrl, path, search = "") {
  const base = new URL(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  base.pathname = `${base.pathname.replace(/\/$/, "")}${normalizedPath}`;
  base.search = search;
  return base;
}

export function parseTargetUrlFromPath(pathname, search = "") {
  const raw = pathname.replace(/^\/+/, "") + search;
  if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
    return null;
  }

  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildProxyRequestHeaders(request, target, extraHeaders = {}) {
  const headers = new Headers();

  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (!DROP_REQUEST_HEADERS.has(lowerKey) && lowerKey !== "host") {
      headers.set(key, value);
    }
  }

  headers.set("Host", target.host);
  headers.set("Referer", target.origin);

  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  return headers;
}

function buildProxyResponseHeaders(upstreamHeaders) {
  const headers = new Headers();

  for (const [key, value] of upstreamHeaders.entries()) {
    if (!HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  }

  return headers;
}

function rewriteRedirectLocation(headers, status, target, redirectBaseUrl) {
  if (!redirectBaseUrl || ![301, 302, 303, 307, 308].includes(status)) {
    return;
  }

  const location = headers.get("Location");
  if (!location) {
    return;
  }

  const absoluteLocation = new URL(location, target).href;
  headers.set("Location", `${redirectBaseUrl}/${absoluteLocation}`);
}

function shouldForwardBody(request) {
  return !["GET", "HEAD"].includes(request.method.toUpperCase());
}

function isTextLike(headers) {
  const contentType = headers.get("Content-Type") ?? "";
  return /json|text|xml|javascript|html|plain/.test(contentType);
}
