import { getLanguage, LANGUAGES } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";

const UPSTREAM = "https://proxy.golang.org";

const COPY = {
  en: {
    lead: "GOPROXY-compatible module list, version metadata, .mod files, and .zip downloads.",
    temporary: "Temporary use",
    persistent: "Persistent config",
    restore: "Restore default",
    mapping: "Example mapping",
    note: "Status: Test. Module proxy paths are available; keep Go's default sumdb settings or your own trusted configuration.",
  },
  es: {
    lead: "Compatible con GOPROXY: module list, metadata de version, archivos .mod y .zip.",
    temporary: "Uso temporal",
    persistent: "Configuracion persistente",
    restore: "Restaurar valor predeterminado",
    mapping: "Ejemplo de mapeo",
    note: "Estado: Test. Las rutas de modulo estan disponibles; conserva sumdb por defecto o tu configuracion confiable.",
  },
  zh: {
    lead: "兼容 Go module proxy 协议，代理 module list、version metadata、mod 文件和 zip 包下载。",
    temporary: "临时使用",
    persistent: "长期配置",
    restore: "恢复默认",
    mapping: "映射示例",
    note: "状态：Test。模块代理路径已可用；sumdb 仍建议使用 Go 默认设置或你自己的可信配置。",
  },
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "go");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const target = joinUrlPath(UPSTREAM, url.pathname, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: baseUrl,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const nav = renderToolNav(request, "go");
  return `<!doctype html>
<html lang="${LANGUAGES[lang].htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Go Module Proxy | DevBox Workers</title>
  <style>${pageCss("#00add8")}</style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <span class="status">Test accelerator</span>
      <h1>Go Module Proxy</h1>
      <p>${escapeHtml(copy.lead)}</p>
    </section>
    <section class="grid">
      ${commandCard(copy.temporary, `GOPROXY=${baseUrl},direct go install golang.org/x/tools/cmd/stringer@latest`)}
      ${commandCard(copy.persistent, `go env -w GOPROXY=${baseUrl},direct`)}
      ${commandCard(copy.restore, "go env -w GOPROXY=https://proxy.golang.org,direct")}
      ${commandCard(copy.mapping, `Original:\nGOPROXY=https://proxy.golang.org,direct go install golang.org/x/tools/cmd/stringer@latest\n\nAccelerated:\nGOPROXY=${baseUrl},direct go install golang.org/x/tools/cmd/stringer@latest`)}
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
    .nav{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;padding:18px 24px}.nav a{color:#475569;text-decoration:none;border:1px solid var(--border);background:#fff;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:700}.nav a.active{background:var(--accent);border-color:var(--accent);color:#fff}
    main{width:min(980px,calc(100% - 32px));margin:34px auto 64px}.hero{border-left:6px solid var(--accent);padding:8px 0 8px 22px;margin-bottom:24px}.status{display:inline-flex;background:#ecfeff;color:#155e75;border:1px solid #a5f3fc;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;text-transform:uppercase}h1{font-size:42px;line-height:1.05;margin:14px 0 10px;letter-spacing:0}p{font-size:16px;line-height:1.7;color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.04)}h2{font-size:15px;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;margin:0;font-size:13px;line-height:1.55}.note{margin-top:22px}
  `;
}
