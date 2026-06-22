import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { corsPreflightResponse, escapeHtml, htmlResponse, joinUrlPath, proxyRequest, textResponse } from "../proxy-utils.js";

const REPOSITORIES = {
  "maven-central": "https://repo1.maven.org/maven2",
  google: "https://dl.google.com/dl/android/maven2",
  "gradle-plugin": "https://plugins.gradle.org/m2",
  jitpack: "https://jitpack.io",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const baseUrl = getToolBaseUrl(request, "maven");

    if (request.method === "OPTIONS") {
      return corsPreflightResponse();
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return htmlResponse(renderPage(request, baseUrl));
    }

    const [, repositoryKey, ...rest] = url.pathname.split("/");
    const upstream = REPOSITORIES[repositoryKey];
    if (!upstream) {
      return textResponse(`Unknown Maven repository: ${repositoryKey || "(empty)"}`, { status: 404 });
    }

    const target = joinUrlPath(upstream, `/${rest.join("/")}`, url.search);
    return proxyRequest(request, target, {
      redirectBaseUrl: `${baseUrl}/${repositoryKey}`,
      cacheControl: "public, max-age=300",
    });
  },
};

function renderPage(request, baseUrl) {
  const nav = renderToolNav(request, "maven");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maven Proxy | DevBox Workers</title>
  <style>${pageCss("#c71a36")}</style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <span class="status">Test accelerator</span>
      <h1>Maven / Gradle Proxy</h1>
      <p>为 Maven Central、Google Maven、Gradle Plugin Portal 和 JitPack 提供统一路径代理。</p>
    </section>
    <section class="grid">
      ${commandCard("Gradle Kotlin DSL", `repositories {\n    maven { url = uri("${baseUrl}/maven-central") }\n    maven { url = uri("${baseUrl}/google") }\n    maven { url = uri("${baseUrl}/gradle-plugin") }\n}`)}
      ${commandCard("Gradle Groovy DSL", `repositories {\n    maven { url "${baseUrl}/maven-central" }\n    maven { url "${baseUrl}/google" }\n    maven { url "${baseUrl}/gradle-plugin" }\n}`)}
      ${commandCard("Maven Central path", `${baseUrl}/maven-central/com/google/guava/guava/maven-metadata.xml`)}
    </section>
    <p class="note">状态：Test。下载和 metadata 代理已可用；Gradle plugin marker 与私有仓库认证建议先做项目级验证。</p>
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
    main{width:min(980px,calc(100% - 32px));margin:34px auto 64px}.hero{border-left:6px solid var(--accent);padding:8px 0 8px 22px;margin-bottom:24px}.status{display:inline-flex;background:#fff1f2;color:#9f1239;border:1px solid #fecdd3;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:800;text-transform:uppercase}h1{font-size:42px;line-height:1.05;margin:14px 0 10px;letter-spacing:0}p{font-size:16px;line-height:1.7;color:var(--muted);max-width:760px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}.card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.04)}h2{font-size:15px;margin:0 0 12px}pre{white-space:pre-wrap;word-break:break-all;background:#0f172a;color:#e2e8f0;border-radius:8px;padding:14px;margin:0;font-size:13px;line-height:1.55}.note{margin-top:22px}
  `;
}
