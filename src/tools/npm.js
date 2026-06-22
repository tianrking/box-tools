import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, proxyRequest } from "../proxy-utils.js";

const UPSTREAM = "https://registry.npmjs.org";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "npm");

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
      transformText: (body) => rewriteRegistryUrls(body, baseUrl),
    });
  },
};

function rewriteRegistryUrls(body, baseUrl) {
  return body
    .replaceAll("https://registry.npmjs.org", baseUrl)
    .replaceAll("http://registry.npmjs.org", baseUrl);
}

function renderPage(request, baseUrl) {
  const nav = renderToolNav(request, "npm");
  const npmCommand = `npm install lodash --registry=${baseUrl}/`;
  const pnpmCommand = `pnpm install lodash --registry=${baseUrl}/`;
  const yarnCommand = `yarn config set registry ${baseUrl}/`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>npm Proxy | DevBox Workers</title>
  <style>${pageCss("#cb3837")}</style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <span class="status">Test accelerator</span>
      <h1>npm / pnpm / yarn Proxy</h1>
      <p>代理 npm registry metadata 与 tarball 下载，适合 Node.js 项目安装依赖时临时或长期配置。</p>
    </section>
    <section class="grid">
      ${commandCard("npm", npmCommand)}
      ${commandCard("pnpm", pnpmCommand)}
      ${commandCard("yarn", yarnCommand)}
      ${commandCard(".npmrc", `registry=${baseUrl}/`)}
    </section>
    <p class="note">状态：Test。已支持 registry metadata rewrite 和 tarball 下载；企业私有 npm token、publish 流程建议先在测试环境验证。</p>
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
    main{width:min(980px,calc(100% - 32px));margin:34px auto 64px}.hero{border-left:6px solid var(--accent);padding:8px 0 8px 22px;margin-bottom:24px}.status{display:inline-flex;background:#fff7ed;color:#9a3412;border:1px solid #fed7aa;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;text-transform:uppercase}h1{font-size:42px;line-height:1.05;margin:14px 0 10px;letter-spacing:0}p{font-size:16px;line-height:1.7;color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.04)}h2{font-size:15px;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;margin:0;font-size:13px;line-height:1.55}.note{margin-top:22px}
  `;
}
