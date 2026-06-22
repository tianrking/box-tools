import { PROJECT, TOOL_DEFINITIONS } from "../config.js";
import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";

export default {
  async fetch(request) {
    return new Response(htmlPage(request), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  },
};

function htmlPage(request) {
  const urls = Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, getToolBaseUrl(request, tool.key)]));
  const dockerHost = getDockerRegistryHost(request);
  const proxyDownloadBase = urls.proxy.endsWith("/proxy") ? urls.proxy : `${urls.proxy}/proxy`;
  const nav = renderToolNav(request, "help");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Help | ${PROJECT.name}</title>
  <meta name="description" content="DevBox Workers help page: one-domain routes, web UI, command line usage, package proxy configuration, Docker registry usage, and deployment notes.">
  <style>
    :root {
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #111827;
      --muted: #5b6472;
      --border: #dbe3ee;
      --blue: #2563eb;
      --green: #16a34a;
      --orange: #f97316;
      --violet: #7c3aed;
      --pink: #d946ef;
      --slate: #0f172a;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .nav {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
      padding: 14px 24px;
      background: rgba(255, 255, 255, 0.86);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(14px);
    }
    .nav a {
      text-decoration: none;
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
      padding: 8px 14px;
      border-radius: 999px;
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }
    .nav a:hover { color: var(--slate); background: #eef2ff; }
    .nav a.active { color: #fff; background: var(--slate); border-color: var(--slate); }

    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 54px 0 80px; }
    .hero { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 36px; align-items: end; margin-bottom: 36px; }
    h1 { margin: 0 0 14px; font-size: clamp(34px, 6vw, 64px); line-height: 1.02; letter-spacing: 0; }
    .lead { margin: 0; max-width: 760px; color: var(--muted); font-size: 18px; line-height: 1.7; }
    .hero-panel {
      border: 1px solid var(--border);
      background: var(--panel);
      border-radius: 8px;
      padding: 22px;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
    }
    .metric { display: flex; justify-content: space-between; gap: 18px; padding: 12px 0; border-bottom: 1px solid #edf2f7; }
    .metric:last-child { border-bottom: 0; }
    .metric span { color: var(--muted); }
    .metric strong { text-align: right; }

    .band { margin-top: 28px; }
    .section-head { display: flex; justify-content: space-between; gap: 16px; align-items: end; margin-bottom: 14px; }
    h2 { margin: 0; font-size: 24px; letter-spacing: 0; }
    .hint { margin: 0; color: var(--muted); line-height: 1.6; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px;
      min-height: 150px;
    }
    .card h3 { margin: 0 0 10px; font-size: 17px; }
    .card p { margin: 0; color: var(--muted); line-height: 1.55; }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 4px 9px;
      border-radius: 999px;
      color: #fff;
      background: var(--blue);
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .pill.green { background: var(--green); }
    .pill.orange { background: var(--orange); }
    .pill.violet { background: var(--violet); }
    .pill.pink { background: var(--pink); }
    .pill.dark { background: var(--slate); }

    .commands { display: grid; gap: 14px; }
    .command {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .command-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 800;
    }
    .command-header span { color: var(--muted); font-size: 13px; font-weight: 700; }
    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      background: #111827;
      color: #d1fae5;
      font-size: 13px;
      line-height: 1.6;
    }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
    .route-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }
    .route-table th, .route-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
    .route-table th { background: #f1f5f9; font-size: 13px; color: var(--muted); }
    .route-table tr:last-child td { border-bottom: 0; }
    .route-table a { color: var(--blue); font-weight: 800; text-decoration: none; }
    .route-table a:hover { text-decoration: underline; }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; }
      .section-head { display: block; }
      .nav { justify-content: flex-start; }
    }
  </style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <div>
        <h1>一个域名，所有加速入口。</h1>
        <p class="lead">DevBox Workers 的推荐玩法是单域名路径路由：网页可直接生成命令，命令行可直接复制使用，包管理器和下载工具可以配置为长期加速入口。</p>
      </div>
      <div class="hero-panel">
        <div class="metric"><span>Primary domain</span><strong>${urls.box}</strong></div>
        <div class="metric"><span>Runtime</span><strong>Cloudflare Workers / Vercel Functions</strong></div>
        <div class="metric"><span>Health</span><strong>${urls.box}/healthz</strong></div>
      </div>
    </section>

    <section class="band">
      <div class="section-head">
        <h2>网页怎么用</h2>
        <p class="hint">打开对应路径，输入包名、模型名、仓库名、镜像名或 URL，页面会生成可复制命令。</p>
      </div>
      <div class="grid">
        <div class="card"><span class="pill">Portal</span><h3>入口面板</h3><p>从 ${urls.box} 进入所有工具，快速查看用法和复制命令。</p></div>
        <div class="card"><span class="pill green">Path mode</span><h3>统一路径</h3><p>所有工具都在同一个域名下，用路径区分服务，适合 Vercel 和单 Worker 部署。</p></div>
        <div class="card"><span class="pill violet">CLI ready</span><h3>命令行友好</h3><p>pip、huggingface-cli、git、docker、wget、curl 都能直接使用生成的加速地址。</p></div>
      </div>
    </section>

    <section class="band">
      <div class="section-head">
        <h2>路径地图</h2>
        <p class="hint">这是当前部署环境下的实际入口。</p>
      </div>
      <table class="route-table">
        <thead><tr><th>资源</th><th>入口</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td><span class="pill green">Stable</span><br>PyPI / PyTorch</td><td><a href="${urls.pypi}">${urls.pypi}</a></td><td>Python 包、PyPI simple index、PyTorch wheel。</td></tr>
          <tr><td><span class="pill green">Stable</span><br>Hugging Face</td><td><a href="${urls.hf}">${urls.hf}</a></td><td>模型、数据集、LFS 大文件下载。</td></tr>
          <tr><td><span class="pill green">Stable</span><br>GitHub</td><td><a href="${urls.github}">${urls.github}</a></td><td>Git clone、Raw、Release 文件。</td></tr>
          <tr><td><span class="pill green">Stable</span><br>Docker</td><td><a href="${urls.docker}">${urls.docker}</a></td><td>网页生成镜像命令；Registry API 使用当前域名的 /v2。</td></tr>
          <tr><td><span class="pill green">Stable</span><br>Linux Mirrors</td><td><a href="${urls.mirrors}">${urls.mirrors}</a></td><td>APT、YUM、DNF、Pacman、wget、curl。</td></tr>
          <tr><td><span class="pill green">Stable</span><br>Universal Proxy</td><td><a href="${urls.proxy}">${urls.proxy}</a></td><td>任意 HTTP/HTTPS 文件下载代理。</td></tr>
          <tr><td><span class="pill orange">Test</span><br>npm Registry</td><td><a href="${urls.npm}">${urls.npm}</a></td><td>npm、pnpm、yarn metadata 和 tarball 下载。</td></tr>
          <tr><td><span class="pill orange">Test</span><br>Go Modules</td><td><a href="${urls.go}">${urls.go}</a></td><td>GOPROXY module metadata、mod 和 zip 文件。</td></tr>
          <tr><td><span class="pill orange">Test</span><br>Maven / Gradle</td><td><a href="${urls.maven}">${urls.maven}</a></td><td>Maven Central、Google Maven、Gradle Plugin Portal、JitPack。</td></tr>
          <tr><td><span class="pill orange">Test</span><br>crates.io Sparse</td><td><a href="${urls.crates}">${urls.crates}</a></td><td>Cargo sparse index 和 crate package 下载。</td></tr>
          <tr><td><span class="pill orange">Test</span><br>Downloads</td><td><a href="${urls.downloads}">${urls.downloads}</a></td><td>Runtime、Open VSX、SourceForge、GitLab/Gitea 和直接 URL 文件。</td></tr>
        </tbody>
      </table>
    </section>

    <section class="band">
      <div class="section-head">
        <h2>命令行怎么用</h2>
        <p class="hint">下面命令会根据当前域名生成，复制即可改包名或资源名使用。</p>
      </div>
      <div class="commands">
        ${commandBlock("PyPI", "pip install numpy -i " + urls.pypi + "/simple/")}
        ${commandBlock("PyTorch", "pip install torch torchvision --index-url " + urls.pypi + "/pytorch/cu118")}
        ${commandBlock("Hugging Face", "export HF_ENDPOINT=" + urls.hf + "\nhuggingface-cli download gpt2")}
        ${commandBlock("GitHub", "git clone " + urls.github + "/tianrking/box-tools.git")}
        ${commandBlock("Docker", "docker pull " + dockerHost + "/library/nginx:latest")}
        ${commandBlock("Docker daemon.json", "{\n  \"registry-mirrors\": [\n    \"https://" + dockerHost + "\"\n  ]\n}")}
        ${commandBlock("APT source", "deb " + urls.mirrors + "/http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse")}
        ${commandBlock("Universal file proxy", "curl -L -O \"" + proxyDownloadBase + "/https://example.com/file.zip\"")}
        ${commandBlock("npm", "npm install lodash --registry=" + urls.npm + "/")}
        ${commandBlock("Go modules", "go env -w GOPROXY=" + urls.go + ",direct")}
        ${commandBlock("Maven / Gradle", "maven { url = uri(\"" + urls.maven + "/maven-central\") }")}
        ${commandBlock("crates.io", "[source.crates-io]\nreplace-with = \"devbox\"\n\n[source.devbox]\nregistry = \"sparse+" + urls.crates + "/\"")}
        ${commandBlock("Runtime downloads", "curl -L -O \"" + urls.downloads + "/node/v22.11.0/node-v22.11.0-x64.msi\"")}
      </div>
    </section>

    <section class="band">
      <div class="section-head">
        <h2>配置和部署</h2>
        <p class="hint">用户可以直接使用网页，也可以把路径写进工具配置里长期使用。</p>
      </div>
      <div class="grid">
        <div class="card"><span class="pill orange">Cloudflare</span><h3>先部署，再绑定域名</h3><p><code>wrangler.toml</code> 默认适合一键部署到任意 Cloudflare 账户。绑定 ${PROJECT.primaryHost} 时，可参考 <code>wrangler.custom-domain.example.toml</code>。</p></div>
        <div class="card"><span class="pill dark">Vercel</span><h3>一键部署</h3><p><code>vercel.json</code> 会把所有路径转给 <code>api/index.js</code>，同一套路径玩法可直接复用。</p></div>
        <div class="card"><span class="pill pink">High availability</span><h3>上线前验证</h3><p>运行 <code>npm run verify</code>，它会检查 JS、页面导航、Vercel 入口、Docker API 路由和高危依赖审计。</p></div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

function commandBlock(title, command) {
  return `<div class="command"><div class="command-header">${title}<span>copy and edit</span></div><pre><code>${escapeHtml(command)}</code></pre></div>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
