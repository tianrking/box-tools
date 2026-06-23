import { getLanguage, LANGUAGES } from "../i18n.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";
import { escapeHtml } from "../proxy-utils.js";

const PREFLIGHT_INIT = {
  headers: new Headers({
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-max-age": "1728000",
  }),
};

const BLOCK_UA = ["netcraft", "baiduspider", "bingbot", "sogou", "360spider"];
const EXAMPLE_URL = "https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi";

const COPY = {
  en: {
    subtitle: "Universal File Fetcher & Header Fixer",
    lead: "Paste any public file URL, then fetch it through the edge with a fixed browser download link and ready terminal commands.",
    inputLabel: "File URL",
    placeholder: "Paste file URL (e.g. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)",
    original: "Original",
    accelerated: "Accelerated",
    browserDownload: "Browser Download",
    terminalCommands: "Terminal Commands",
    downloadNow: "Download Now",
    waiting: "Waiting for a valid URL...",
    copy: "Copy",
    copied: "Copied",
    examples: "Ready examples",
    tips: "WGET standard download · CURL saves files with -O",
  },
  es: {
    subtitle: "Descargador universal con ajuste de headers",
    lead: "Pega una URL publica de archivo y descargala por el edge con enlace de navegador y comandos listos.",
    inputLabel: "URL de archivo",
    placeholder: "Pega una URL de archivo (ej. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)",
    original: "Original",
    accelerated: "Acelerado",
    browserDownload: "Descarga en navegador",
    terminalCommands: "Comandos de terminal",
    downloadNow: "Descargar ahora",
    waiting: "Esperando una URL valida...",
    copy: "Copiar",
    copied: "Copiado",
    examples: "Ejemplos listos",
    tips: "WGET descarga estandar · CURL guarda archivos con -O",
  },
  zh: {
    subtitle: "通用文件下载与请求头修复",
    lead: "粘贴任意公开文件 URL，即可通过边缘节点下载，并自动生成浏览器下载链接和命令行用法。",
    inputLabel: "文件 URL",
    placeholder: "粘贴文件 URL，例如 https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi",
    original: "原始地址",
    accelerated: "加速地址",
    browserDownload: "浏览器下载",
    terminalCommands: "命令行",
    downloadNow: "立即下载",
    waiting: "等待有效 URL...",
    copy: "复制",
    copied: "已复制",
    examples: "常用示例",
    tips: "WGET 标准下载 · CURL 使用 -O 保存文件",
  },
};

const EXAMPLES = [
  ["Node.js", EXAMPLE_URL],
  ["Python", "https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe"],
  ["Go", "https://go.dev/dl/go1.23.3.windows-amd64.msi"],
];

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const userAgent = (request.headers.get("User-Agent") || "").toLowerCase();

    if (request.method === "OPTIONS") return new Response(null, PREFLIGHT_INIT);
    if (BLOCK_UA.some((ua) => userAgent.includes(ua))) return new Response("403 Forbidden", { status: 403 });

    if (url.pathname.startsWith("/proxy/")) {
      let targetUrlStr = url.pathname.substring(7);

      targetUrlStr = decodeIfNeeded(targetUrlStr);
      targetUrlStr = correctUrlScheme(targetUrlStr);

      if (url.search) targetUrlStr += url.search;

      try {
        const newHeaders = new Headers(request.headers);
        newHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        newHeaders.delete("Host");
        newHeaders.delete("Referer");

        const response = await fetch(targetUrlStr, {
          method: "GET",
          headers: newHeaders,
          redirect: "follow",
        });

        if (!response.ok) {
          return new Response(`Error: ${response.status} ${response.statusText}`, { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const contentDisposition = response.headers.get("content-disposition");
        let filename = contentDisposition ? contentDisposition.split("filename=")[1] : getFilenameFromUrl(targetUrlStr, contentType);

        if (filename) filename = filename.replace(/["']/g, "");

        const headers = new Headers(response.headers);
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        headers.set("Access-Control-Allow-Origin", "*");

        return new Response(response.body, { headers });
      } catch (error) {
        return new Response(`Fetch Error: ${error.message}`, { status: 500 });
      }
    }

    if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/proxy" || url.pathname === "/proxy/index.html") {
      return new Response(htmlPage(request), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response("Not Found", { status: 404 });
  },
};

function getExtensionFromMimeType(mimeType) {
  if (!mimeType) return "";
  const mimeMap = {
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "application/x-gzip": ".tar.gz",
    "application/x-tar": ".tar",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "text/plain": ".txt",
    "text/html": ".html",
    "application/json": ".json",
    "application/javascript": ".js",
  };
  const cleanMime = mimeType.split(";")[0].trim();
  return mimeMap[cleanMime] || "";
}

function decodeIfNeeded(urlStr) {
  try {
    return decodeURIComponent(urlStr);
  } catch {
    return urlStr;
  }
}

function correctUrlScheme(urlStr) {
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) return `https://${urlStr}`;
  return urlStr;
}

function getFilenameFromUrl(urlStr, contentType) {
  try {
    const url = new URL(urlStr);
    let filename = url.pathname.split("/").pop();
    if (!filename) filename = "download";
    if (!filename.includes(".")) filename += getExtensionFromMimeType(contentType);
    return filename;
  } catch {
    return "download.bin";
  }
}

function htmlPage(request) {
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const baseUrl = getToolBaseUrl(request, "proxy");
  const downloadBaseUrl = baseUrl.endsWith("/proxy") ? baseUrl : `${baseUrl}/proxy`;
  const acceleratedExample = `${downloadBaseUrl}/${EXAMPLE_URL}`;
  const nav = renderToolNav(request, "proxy");

  return `<!doctype html>
<html lang="${LANGUAGES[lang].htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Proxy Downloader | DevBox Workers</title>
  <style>${proxyPageCss()}</style>
</head>
<body>
  ${nav}
  <main class="proxy-shell">
    <section class="proxy-hero">
      <div class="hero-copy">
        <span class="status-pill">Universal Proxy</span>
        <h1>Proxy Downloader</h1>
        <p class="subtitle">${escapeHtml(copy.subtitle)}</p>
        <p>${escapeHtml(copy.lead)}</p>
      </div>
      <div class="download-panel">
        <label for="urlInput">${escapeHtml(copy.inputLabel)}</label>
        <input type="url" id="urlInput" value="${escapeHtml(EXAMPLE_URL)}" placeholder="${escapeHtml(copy.placeholder)}" autocomplete="off">
        <div class="accelerated-box">
          <span>${escapeHtml(copy.browserDownload)}</span>
          <code id="linkText">${escapeHtml(acceleratedExample)}</code>
          <a href="${escapeHtml(acceleratedExample)}" id="downloadBtn" class="download-btn" target="_blank" rel="noreferrer">${escapeHtml(copy.downloadNow)}</a>
        </div>
      </div>
    </section>

    <section class="mapping-grid" aria-label="Example mapping">
      <article class="mapping-card">
        <span>${escapeHtml(copy.original)}</span>
        <code id="originalText">${escapeHtml(EXAMPLE_URL)}</code>
      </article>
      <article class="mapping-card strong">
        <span>${escapeHtml(copy.accelerated)}</span>
        <code id="acceleratedText">${escapeHtml(acceleratedExample)}</code>
      </article>
    </section>

    <section class="command-grid">
      <article class="command-card">
        <div class="card-head">
          <span>wget</span>
          <button type="button" data-copy-target="wgetText">${escapeHtml(copy.copy)}</button>
        </div>
        <pre><code id="wgetText">wget "${escapeHtml(acceleratedExample)}"</code></pre>
      </article>
      <article class="command-card">
        <div class="card-head">
          <span>curl</span>
          <button type="button" data-copy-target="curlText">${escapeHtml(copy.copy)}</button>
        </div>
        <pre><code id="curlText">curl -L -O "${escapeHtml(acceleratedExample)}"</code></pre>
      </article>
    </section>

    <section class="examples">
      <div class="section-title">${escapeHtml(copy.examples)}</div>
      <div class="example-grid">
        ${EXAMPLES.map(([name, exampleUrl]) => `<button type="button" class="example-card" data-example-url="${escapeHtml(exampleUrl)}"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(exampleUrl)}</span></button>`).join("")}
      </div>
    </section>

    <p class="tips">${escapeHtml(copy.tips)}</p>
  </main>
  <script>
    (function () {
      var downloadBaseUrl = ${JSON.stringify(downloadBaseUrl)};
      var waitingText = ${JSON.stringify(copy.waiting)};
      var copyText = ${JSON.stringify(copy.copy)};
      var copiedText = ${JSON.stringify(copy.copied)};
      var input = document.getElementById("urlInput");
      var originalText = document.getElementById("originalText");
      var acceleratedText = document.getElementById("acceleratedText");
      var linkText = document.getElementById("linkText");
      var downloadBtn = document.getElementById("downloadBtn");
      var wgetText = document.getElementById("wgetText");
      var curlText = document.getElementById("curlText");

      function buildUrl(value) {
        var raw = (value || "").trim();
        if (!/^https?:\\/\\//i.test(raw)) return "";
        return downloadBaseUrl + "/" + raw;
      }

      function update() {
        var raw = (input.value || "").trim();
        var proxyUrl = buildUrl(raw);
        originalText.textContent = raw || waitingText;
        acceleratedText.textContent = proxyUrl || waitingText;
        linkText.textContent = proxyUrl || waitingText;
        downloadBtn.href = proxyUrl || "#";
        wgetText.textContent = proxyUrl ? 'wget "' + proxyUrl + '"' : waitingText;
        curlText.textContent = proxyUrl ? 'curl -L -O "' + proxyUrl + '"' : waitingText;
      }

      input.addEventListener("input", update);
      document.querySelectorAll("[data-example-url]").forEach(function (button) {
        button.addEventListener("click", function () {
          input.value = button.getAttribute("data-example-url") || "";
          update();
        });
      });
      document.querySelectorAll("[data-copy-target]").forEach(function (button) {
        button.addEventListener("click", function () {
          var target = document.getElementById(button.getAttribute("data-copy-target"));
          navigator.clipboard.writeText(target.textContent || "").then(function () {
            button.textContent = copiedText;
            window.setTimeout(function () { button.textContent = copyText; }, 1400);
          });
        });
      });
      update();
    })();
  </script>
</body>
</html>`;
}

function proxyPageCss() {
  return `
    :root{--bg:#f4fbff;--panel:#fff;--text:#0f172a;--muted:#5b6b7a;--border:#d8eaf3;--soft:#eef8ff;--accent:#0284c7;--accent-strong:#0369a1;--teal:#0f766e;--code:#0f1b2d;--code-text:#d9faff;--shadow:0 12px 30px rgba(2,132,199,.08)}
    *{box-sizing:border-box}body{margin:0;min-height:100vh;color:var(--text);background:linear-gradient(180deg,#fff 0%,var(--bg) 52%,#eef8fb 100%);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .proxy-shell{width:min(980px,calc(100% - 32px));margin:0 auto;padding:42px 0 72px}
    .proxy-hero{display:grid;grid-template-columns:minmax(0,.92fr) minmax(360px,1.08fr);gap:14px;align-items:stretch;margin-bottom:14px}
    .hero-copy,.download-panel,.mapping-card,.command-card,.examples,.tips{background:rgba(255,255,255,.94);border:1px solid var(--border);border-radius:8px;box-shadow:var(--shadow)}
    .hero-copy{padding:26px;border-left:6px solid var(--accent);display:flex;flex-direction:column;justify-content:center;gap:10px}
    .status-pill{align-self:flex-start;display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border:1px solid #bae6fd;border-radius:999px;background:#f0f9ff;color:var(--accent-strong);font-size:12px;font-weight:900;text-transform:uppercase}
    h1{margin:2px 0 0;font-size:clamp(32px,4.1vw,46px);line-height:1.06;letter-spacing:0}.subtitle{margin:0;color:var(--teal);font-size:15px;font-weight:900}p{margin:0;color:var(--muted);font-size:15px;line-height:1.66}
    .download-panel{padding:22px;display:grid;gap:12px}label,.section-title{font-size:13px;font-weight:900;color:var(--text)}input{width:100%;min-height:46px;border:1px solid var(--border);border-radius:8px;padding:0 13px;color:var(--text);background:#fff;font:13px "SFMono-Regular",Consolas,monospace;outline:none}input:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(2,132,199,.14)}
    .accelerated-box{display:grid;gap:8px}.accelerated-box span,.mapping-card span{font-size:12px;font-weight:900;color:var(--muted);text-transform:uppercase}.accelerated-box code,.mapping-card code{display:block;background:#f8fbfd;border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text);font-size:12px;line-height:1.5;word-break:break-word}
    .download-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:8px;background:var(--accent);color:#fff;text-decoration:none;font-size:13px;font-weight:900}.download-btn:hover{background:var(--accent-strong)}
    .mapping-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}.mapping-card{padding:14px;display:grid;gap:8px}.mapping-card.strong{border-color:#b6e3f5;background:linear-gradient(180deg,#fff,#f6fcff)}
    .command-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}.command-card{overflow:hidden}.card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:50px;padding:12px 14px;border-bottom:1px solid var(--border)}.card-head span{font-size:13px;font-weight:900;text-transform:uppercase}.card-head button{min-height:32px;border:1px solid var(--accent);background:var(--accent);color:#fff;border-radius:8px;padding:0 11px;font-size:12px;font-weight:900;cursor:pointer}
    pre{margin:0;padding:14px;background:var(--code);color:var(--code-text);font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word}code{font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace}
    .examples{padding:16px;margin-bottom:14px}.section-title{margin-bottom:12px}.example-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.example-card{display:grid;gap:6px;text-align:left;border:1px solid var(--border);border-radius:8px;background:#fff;padding:12px;cursor:pointer}.example-card:hover{border-color:var(--accent);background:#fbfdff}.example-card strong{font-size:14px}.example-card span{color:var(--muted);font-size:12px;line-height:1.4;word-break:break-word}
    .tips{padding:14px 16px;color:var(--muted);font-size:13px;line-height:1.65}
    @media(max-width:760px){.proxy-shell{width:min(100% - 24px,640px);padding:24px 0 54px}.proxy-hero,.mapping-grid,.command-grid{grid-template-columns:1fr}.hero-copy,.download-panel{padding:18px}.example-grid{grid-template-columns:1fr}h1{font-size:34px}}
  `;
}
