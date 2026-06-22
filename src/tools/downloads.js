import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, parseTargetUrlFromPath, proxyRequest, textResponse } from "../proxy-utils.js";

const SOURCES = {
  node: "https://nodejs.org/dist",
  python: "https://www.python.org/ftp/python",
  golang: "https://go.dev/dl",
  rustup: "https://static.rust-lang.org",
  openvsx: "https://open-vsx.org",
  sourceforge: "https://downloads.sourceforge.net",
  gitlab: "https://gitlab.com",
  gitea: "https://gitea.com",
  cmake: "https://github.com/Kitware/CMake/releases/download",
  "git-for-windows": "https://github.com/git-for-windows/git/releases/download",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "downloads");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const directTarget = parseTargetUrlFromPath(url.pathname, url.search);
    if (directTarget) {
      return proxyRequest(request, directTarget, {
        redirectBaseUrl: baseUrl,
        cacheControl: "public, max-age=300",
      });
    }

    const [, sourceKey, ...rest] = url.pathname.split("/");
    const upstream = SOURCES[sourceKey];
    if (!upstream) {
      return textResponse(`Unknown download source: ${sourceKey || "(empty)"}`, { status: 404 });
    }

    const target = joinUrlPath(upstream, `/${rest.join("/")}`, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: `${baseUrl}/${sourceKey}`,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const nav = renderToolNav(request, "downloads");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Downloads Proxy | DevBox Workers</title>
  <style>${pageCss("#0f766e")}</style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <span class="status">Test accelerator</span>
      <h1>Runtime & Release Downloads</h1>
      <p>统一代理常见运行时、开发工具、Open VSX、SourceForge、GitLab/Gitea release 文件，也支持直接粘贴完整 HTTP URL。</p>
    </section>
    <section class="grid">
      ${commandCard("Node.js", `${baseUrl}/node/v22.11.0/node-v22.11.0-x64.msi`)}
      ${commandCard("Python", `${baseUrl}/python/3.12.7/python-3.12.7-amd64.exe`)}
      ${commandCard("Go", `${baseUrl}/golang/go1.23.3.windows-amd64.msi`)}
      ${commandCard("Rustup", `${baseUrl}/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe`)}
      ${commandCard("Open VSX", `${baseUrl}/openvsx/api/redhat/java/latest/file/redhat.java.vsix`)}
      ${commandCard("Direct URL", `${baseUrl}/https://example.com/file.zip`)}
    </section>
    <p class="note">状态：Test。适合二进制安装包和 release asset 下载；带登录态或反盗链的上游仍需要按原站规则处理。</p>
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
    main{width:min(980px,calc(100% - 32px));margin:34px auto 64px}.hero{border-left:6px solid var(--accent);padding:8px 0 8px 22px;margin-bottom:24px}.status{display:inline-flex;background:#f0fdfa;color:#115e59;border:1px solid #99f6e4;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;text-transform:uppercase}h1{font-size:42px;line-height:1.05;margin:14px 0 10px;letter-spacing:0}p{font-size:16px;line-height:1.7;color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.04)}h2{font-size:15px;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;margin:0;font-size:13px;line-height:1.55}.note{margin-top:22px}
  `;
}
