import { getLanguage, LANGUAGES } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";

const INDEX_UPSTREAM = "https://index.crates.io";
const DOWNLOAD_UPSTREAM = "https://static.crates.io/crates";

const COPY = {
  en: {
    lead: "Proxy the crates.io sparse index and crate downloads for Rust / Cargo dependency fetching.",
    env: "One-shot environment variable",
    testIndex: "Test index",
    mapping: "Example mapping",
    note: "Status: Test. Sparse index and crate downloads are proxied; publish, yank, and token APIs are outside the current stable scope.",
  },
  es: {
    lead: "Proxy del sparse index de crates.io y descargas .crate para Rust / Cargo.",
    env: "Variable de entorno puntual",
    testIndex: "Probar index",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Sparse index y descargas .crate estan proxied; publish, yank y token API quedan fuera del alcance estable.",
  },
  zh: {
    lead: "代理 crates.io sparse index 和 crate 包下载，适合 Rust / Cargo 项目依赖拉取。",
    env: "单次环境变量",
    testIndex: "测试 index",
    mapping: "映射示例",
    note: "状态：Test。Sparse index 与 crate download 已代理；publish、yank、token API 不在当前稳定范围。",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "crates");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const downloadMatch = url.pathname.match(/^\/api\/v1\/crates\/([^/]+)\/([^/]+)\/download$/);
    if (downloadMatch) {
      const [, crateName, version] = downloadMatch;
      const target = joinUrlPath(DOWNLOAD_UPSTREAM, `/${crateName}/${crateName}-${version}.crate`, url.search);
      return proxyRequest(request, target, {
        redirectBaseUrl: baseUrl,
        cacheControl: "public, max-age=31536000, immutable",
      });
    }

    const target = joinUrlPath(INDEX_UPSTREAM, url.pathname, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: baseUrl,
      cacheControl: "public, max-age=300",
      forceTextTransform: url.pathname === "/config.json",
      transformText: (body) => rewriteSparseConfig(body, baseUrl, url.pathname),
    });
  },
};

function rewriteSparseConfig(body, baseUrl, pathname) {
  if (pathname !== "/config.json") {
    return body;
  }

  try {
    const config = JSON.parse(body);
    config.dl = `${baseUrl}/api/v1/crates`;
    return `${JSON.stringify(config, null, 2)}\n`;
  } catch {
    return body;
  }
}

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "crates");
  return `<!doctype html>
<html lang="${LANGUAGES[lang].htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Crates Proxy | DevBox Workers</title>
  <style>${pageCss("#dea584")}</style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <span class="status">Test accelerator</span>
      <h1>crates.io Sparse Proxy</h1>
      <p>${escapeHtml(copy.lead)}</p>
    </section>
    <section class="grid">
      ${commandCard(".cargo/config.toml", `[source.crates-io]\nreplace-with = "devbox"\n\n[source.devbox]\nregistry = "sparse+${baseUrl}/"`)}
      ${commandCard(copy.env, `CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse cargo fetch`)}
      ${commandCard(copy.testIndex, `${baseUrl}/config.json`)}
      ${commandCard(copy.mapping, `Original:\nsparse+https://index.crates.io/\nserde = "1"\n\nAccelerated:\nsparse+${baseUrl}/\nserde = "1"`)}
    </section>
    <p class="note">${escapeHtml(copy.note)}</p>
  </main>
</body>
</html>`;
}

function commandCard(title, command) {
  return `<article class="card"><h2>${escapeHtml(title)}</h2><pre>${escapeHtml(command)}</pre></article>`;
}

function pageCss(accent) {
  return `
    :root{--accent:${accent};--bg:#f8fafc;--text:#0f172a;--muted:#64748b;--border:#e2e8f0;--card:#fff}
    *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;min-height:100vh}
    .nav{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:18px 24px}.nav a{color:#475569;text-decoration:none;border:1px solid var(--border);background:#fff;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:700}.nav a.active{background:var(--accent);border-color:#b76e47;color:#fff}
    main{width:min(980px,calc(100% - 32px));margin:34px auto 64px}.hero{border-left:6px solid var(--accent);padding:8px 0 8px 22px;margin-bottom:24px}.status{display:inline-flex;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;text-transform:uppercase}h1{font-size:42px;line-height:1.05;margin:14px 0 10px;letter-spacing:0}p{font-size:16px;line-height:1.7;color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.04)}h2{font-size:15px;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;margin:0;font-size:13px;line-height:1.55}.note{margin-top:22px}
  `;
}
