import { hasNativeHtmlRewriter, rewriteHtmlResponse } from "../html.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";

/**
 * Python Universal Proxy (PyPI + PyTorch + Nav)
 * 路径: /pypi
 * 功能: 
 * 1. 标准 PyPI 加速 (/simple/)
 * 2. PyTorch 专用加速 (/pytorch/)
 * 3. 顶部导航栏互联
 * 4. 粒子特效 UI
 */

// 1. 上游配置
const UPSTREAM_PYPI_INDEX = "https://pypi.org";
const UPSTREAM_PYPI_FILES = "https://files.pythonhosted.org";
const UPSTREAM_PYTORCH = "https://download.pytorch.org/whl";

const PREFLIGHT_INIT = {
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

// 屏蔽爬虫
const BLOCK_UA = ['netcraft', 'baiduspider', 'bingbot', 'sogou', '360spider'];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const userAgent = (request.headers.get('User-Agent') || "").toLowerCase();
        const workerUrl = getToolBaseUrl(request, "pypi");

        // 1. 处理 CORS
        if (request.method === 'OPTIONS') {
            return new Response(null, PREFLIGHT_INIT);
        }

        // 2. 防爬虫
        if (BLOCK_UA.some(ua => userAgent.includes(ua))) {
            return new Response("403 Forbidden", { status: 403 });
        }

        // 3. 根路径返回 UI
        if (url.pathname === '/' || url.pathname === '/index.html') {
            return new Response(htmlPage(request), {
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }
        if (url.pathname === '/favicon.ico') return new Response(null, { status: 404 });

        // ================== 路由分发逻辑 ==================

        // 🟢 通道 1: PyTorch 加速通道
        // 识别特征: 路径以 /pytorch/ 开头
        // 映射关系: /pytorch/cu118/xxx -> https://download.pytorch.org/whl/cu118/xxx
        if (url.pathname.startsWith('/pytorch/')) {
            // 移除 /pytorch 前缀，拼接到 PyTorch 官方源后面
            const pytorchPath = url.pathname.replace(/^\/pytorch/, '');
            return proxyPytorch(request, UPSTREAM_PYTORCH + pytorchPath, workerUrl);
        }

        // 🔵 通道 2: 标准 PyPI 文件下载
        if (url.pathname.startsWith('/packages/')) {
            return proxyDownload(request, UPSTREAM_PYPI_FILES);
        }

        // 🔵 通道 3: 标准 PyPI 索引 (/simple/)
        if (url.pathname.startsWith('/simple/') || url.pathname.startsWith('/pypi/')) {
            return proxyPyPiIndex(request, UPSTREAM_PYPI_INDEX, workerUrl);
        }

        // 默认回退: 尝试作为 PyPI 下载处理
        return proxyDownload(request, UPSTREAM_PYPI_INDEX);
    }
};

/**
 * 专门处理 PyTorch 的请求
 */
async function proxyPytorch(request, targetUrlStr, workerUrl) {
    const targetUrl = new URL(targetUrlStr);
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);
    newHeaders.set('Referer', targetUrl.origin);
    newHeaders.delete('Authorization');

    const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
        redirect: 'follow'
    });

    // PyTorch 主要是 HTML 目录列表和 .whl 文件
    // HTML 里的链接通常是相对路径，但也可能有绝对路径，为了保险我们重写一下
    const contentType = response.headers.get("Content-Type") || "";
    
    // 如果是 HTML 目录，重写里面的绝对链接 (如果有的话)
    if (contentType.includes("text/html")) {
        if (!hasNativeHtmlRewriter()) {
            return rewriteHtmlResponse(response, (html) =>
                html.replaceAll("https://download.pytorch.org/whl", `${workerUrl}/pytorch`)
            );
        }
        return new HTMLRewriter()
            .on("a", new PytorchLinkRewriter(workerUrl))
            .transform(response);
    }

    return response;
}

/**
 * 处理标准 PyPI 索引 (HTML/JSON)
 */
async function proxyPyPiIndex(request, upstream, workerUrl) {
    const url = new URL(request.url);
    const targetUrl = new URL(upstream + url.pathname + url.search);
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);
    newHeaders.set('Referer', targetUrl.origin);
    newHeaders.delete('Accept-Encoding'); 

    const response = await fetch(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow'
    });

    const contentType = response.headers.get("Content-Type") || "";
    
    // JSON 处理 (新版 pip)
    if (contentType.includes("json")) {
        let text = await response.text();
        text = text.replaceAll("https://files.pythonhosted.org", workerUrl);
        return new Response(text, { status: response.status, headers: response.headers });
    }

    // HTML 处理 (旧版 pip/浏览器)
    if (contentType.includes("text/html")) {
        if (!hasNativeHtmlRewriter()) {
            return rewriteHtmlResponse(response, (html) =>
                html.replaceAll("https://files.pythonhosted.org", workerUrl)
            );
        }
        return new HTMLRewriter()
            .on("a", new PyPiLinkRewriter(workerUrl))
            .transform(response);
    }
    return response;
}

/**
 * 通用文件下载代理
 */
async function proxyDownload(request, upstream) {
    const url = new URL(request.url);
    // 注意：如果是 PyPI 文件，upstream 是 files.pythonhosted.org
    // 此时不需要保留 pathname 里的前缀，因为 PyPI 的 URL 结构是固定的
    const targetUrl = new URL(upstream + url.pathname + url.search);
    
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetUrl.hostname);
    newHeaders.set('Referer', targetUrl.origin);
    newHeaders.delete('Authorization');

    const response = await fetch(new Request(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
        redirect: 'follow'
    }));
    
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, { status: response.status, headers: responseHeaders });
}

// ---------------- HTML Rewriters ----------------

class PyPiLinkRewriter {
    constructor(workerUrl) { this.workerUrl = workerUrl; }
    element(element) {
        const href = element.getAttribute("href");
        if (href) {
            element.setAttribute("href", href.replace("https://files.pythonhosted.org", this.workerUrl));
        }
    }
}

class PytorchLinkRewriter {
    constructor(workerUrl) { this.workerUrl = workerUrl; }
    element(element) {
        const href = element.getAttribute("href");
        if (href && href.startsWith("https://download.pytorch.org")) {
            // 将官方绝对路径替换为 Worker 路径
            // https://download.pytorch.org/whl/cu118/xxx -> https://worker/pytorch/cu118/xxx
            element.setAttribute("href", href.replace("https://download.pytorch.org/whl", this.workerUrl + "/pytorch"));
        }
    }
}

// -----------------------------------------------------------
// 现代版 UI (粒子背景 + 导航栏)
// -----------------------------------------------------------
function htmlPage(request) {
    const baseUrl = getToolBaseUrl(request, "pypi");
    const nav = renderToolNav(request, "pypi");
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Python Proxy | w0x7ce</title>
    <style>
        :root { --text-main: #24292f; --text-muted: #57606a; --accent: #ee4c2c; /* PyTorch Red */ --btn-bg: #3775a9; /* Python Blue */ --btn-hover: #2a5b84; --border: #d0d7de; --cmd-bg: #161b22; --cmd-text: #7ee787; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: var(--text-main); display: flex; justify-content: center; align-items: center; min-height: 100vh; flex-direction: column; overflow: hidden; position: relative; background: #f0f2f5; }
        
        /* 顶部导航栏 */
        .nav { position: absolute; top: 20px; right: 30px; display: flex; gap: 10px; z-index: 100; flex-wrap: wrap; justify-content: flex-end; }
        .nav a { text-decoration: none; color: #57606a; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; transition: all 0.2s; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(4px); }
        .nav a:hover { color: var(--btn-bg); background: #fff; }
        .nav a.active { background: var(--btn-bg); color: #fff; border-color: var(--btn-bg); box-shadow: 0 2px 8px rgba(55, 117, 169, 0.3); }

        #canvas-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        .container { width: 100%; max-width: 680px; background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); border-radius: 12px; padding: 40px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; position: relative; z-index: 1; transition: transform 0.3s ease; }
        .container:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); }
        .header { margin-bottom: 30px; }
        .logo { width: 64px; height: 64px; margin-bottom: 15px; }
        h1 { font-size: 24px; font-weight: 300; letter-spacing: -0.5px; margin: 0; }
        h1 b { font-weight: 600; color: #ee4c2c; }
        .input-group { margin-bottom: 25px; text-align: left; position: relative; }
        label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-main); }
        input[type="text"] { width: 100%; padding: 12px 14px; background-color: rgba(255,255,255,0.8); border: 1px solid var(--border); border-radius: 6px; font-size: 16px; color: var(--text-main); outline: none; transition: all 0.2s; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
        input[type="text"]:focus { background-color: #fff; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(238, 76, 44, 0.3); }
        .result-box { background-color: var(--cmd-bg); border-radius: 8px; padding: 16px; margin-top: 20px; text-align: left; position: relative; display: none; box-shadow: 0 4px 15px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.1); }
        .result-box.show { display: block; animation: slideDown 0.3s ease-out; }
        .cmd-label { font-size: 12px; color: #8b949e; margin-bottom: 6px; display: block; }
        .cmd-text { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; color: var(--cmd-text); font-size: 14px; word-break: break-all; line-height: 1.5; padding-right: 60px; }
        .example-pair { margin-top: 16px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; text-align: left; background: rgba(255,255,255,0.72); }
        .example-row { display: grid; grid-template-columns: 104px minmax(0,1fr); gap: 10px; padding: 10px 12px; border-top: 1px solid var(--border); align-items: center; }
        .example-row:first-child { border-top: 0; }
        .example-row span { color: var(--text-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .example-row code { color: var(--text-main); font-size: 12px; word-break: break-all; }
        .copy-btn { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); background-color: var(--btn-bg); color: #fff; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; box-shadow: 0 1px 0 rgba(0,0,0,0.1); }
        .copy-btn:hover { background-color: var(--btn-hover); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .copy-btn:active { transform: translateY(-50%) scale(0.96); }
        .tips { margin-top: 30px; font-size: 13px; color: var(--text-muted); text-align: left; border-top: 1px solid var(--border); padding-top: 20px; }
        .tips p { margin-bottom: 8px; display: flex; align-items: center; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; margin-right: 8px; background: #fff0eb; color: #9f1239; border: 1px solid rgba(159, 18, 57, 0.22); }
        .badge-blue { background: #e1f6fc; color: #1d4ed8; border: 1px solid rgba(29, 78, 216, 0.22); }
        .footer { margin-top: 30px; font-size: 13px; color: rgba(36, 41, 47, 0.6); text-align: center; position: relative; z-index: 1; }
        .footer a { text-decoration: none; color: var(--text-muted); font-weight: 600; transition: color 0.2s; }
        .footer a:hover { color: var(--accent); }
        .heart { color: #be123c; margin: 0 4px; display: inline-block; animation: beat 1.5s infinite; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    </style>
</head>
<body>
    ${nav}

    <canvas id="canvas-bg"></canvas>
    <div class="container">
        <div class="header">
            <svg class="logo" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.72 18.06c.64-.69 1.15-1.57 1.48-2.58.34-1.02.48-2.12.39-3.21-.08-1.09-.39-2.14-.9-3.09-.51-.95-1.2-1.77-2.02-2.39-.82-.62-1.78-1.03-2.81-1.18-1.03-.15-2.09-.03-3.08.35-.99.38-1.89.98-2.61 1.76-.72.78-1.25 1.72-1.53 2.76l1.83.49c.17-.62.49-1.19.92-1.65.43-.47.97-.82 1.56-1.05.59-.23 1.23-.3 1.84-.21.62.09 1.19.33 1.68.7.49.37.9.86 1.2 1.43.3.57.49 1.2.54 1.85.05.65-.03 1.31-.23 1.92-.2.61-.51 1.13-.89 1.55l2.63 2.54z" fill="#EE4C2C"/><path d="M6.28 5.94c-.64.69-1.15 1.57-1.48 2.58-.34 1.02-.48 2.12-.39 3.21.08 1.09.39 2.14.9 3.09.51.95 1.2 1.77 2.02 2.39.82.62 1.78 1.03 2.81 1.18 1.03.15 2.09.03 3.08-.35.99-.38 1.89-.98 2.61-1.76.72-.78 1.25-1.72 1.53-2.76l-1.83-.49c-.17.62-.49 1.19-.92 1.65-.43.47-.97.82-1.56 1.05-.59.23-1.23.3-1.84.21-.62-.09-1.19-.33-1.68-.7-.49-.37-.9-.86-1.2-1.43-.3-.57-.49-1.2-.54-1.85-.05-.65.03-1.31.23-1.92.2-.61.51-1.13.89-1.55L7.22 5.94h-.94z" fill="#3775A9"/></svg>
            <h1>Python <b>Proxy</b></h1>
        </div>
        <div class="input-group">
            <label>Install Package (自动识别 PyTorch)</label>
            <input type="text" id="urlInput" placeholder="例如: torch 或 numpy" autocomplete="off" spellcheck="false">
        </div>
        <div class="result-box" id="resultBox">
            <span class="cmd-label">Terminal Command:</span>
            <div class="cmd-text" id="cmdText"></div>
            <button class="copy-btn" onclick="copyCmd()">复制</button>
        </div>
        <div class="example-pair">
            <div class="example-row"><span>Original</span><code>pip install numpy -i https://pypi.org/simple/</code></div>
            <div class="example-row"><span>Accelerated</span><code>pip install numpy -i ${baseUrl}/simple/</code></div>
            <div class="example-row"><span>PyTorch</span><code>pip install torch torchvision --index-url ${baseUrl}/pytorch/cu118</code></div>
        </div>
        <div class="tips">
            <p><span class="badge-blue">STANDARD</span> <code>/simple/</code> 加速标准 PyPI 包</p>
            <p><span class="badge">PYTORCH</span> <code>/pytorch/</code> 加速 PyTorch/CUDA 大文件</p>
            <p><span class="badge-blue">SMART</span> 自动匹配 CUDA 版本 (默认 cu118)</p>
        </div>
    </div>
    <div class="footer">Made with <span class="heart">❤</span> by <a href="https://github.com/w0x7ce" target="_blank">w0x7ce</a></div>
    <script>
        const baseUrl = "${baseUrl}";
        const input = document.getElementById('urlInput');
        const resultBox = document.getElementById('resultBox');
        const cmdText = document.getElementById('cmdText');
        input.addEventListener('input', function() {
            const val = this.value.trim();
            if (!val) { resultBox.classList.remove('show'); return; }
            let cleanVal = val.replace(/^pip install\\s+/, '');
            
            let cmd = "";
            // 简单判断是否是 torch 相关
            if (cleanVal.includes("torch") || cleanVal.includes("vision") || cleanVal.includes("audio")) {
                // PyTorch 专用命令
                // 默认使用 cu118，映射到 https://download.pytorch.org/whl/cu118
                cmd = \`pip install \${cleanVal} --index-url \${baseUrl}/pytorch/cu118\`;
            } else {
                // 标准 PyPI 命令
                cmd = \`pip install \${cleanVal} -i \${baseUrl}/simple/\`;
            }
            
            cmdText.textContent = cmd;
            resultBox.classList.add('show');
        });
        function copyCmd() {
            const text = cmdText.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = "已复制!";
                btn.style.backgroundColor = "#ee4c2c";
                setTimeout(() => { btn.textContent = originalText; btn.style.backgroundColor = ""; }, 2000);
            });
        }
        (function() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let width, height; let particles = [];
            const particleCount = 60; const connectionDistance = 150; const mouseDistance = 200; 
            let mouse = { x: null, y: null };
            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
            window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
            function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
            class Particle {
                constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; this.size = Math.random() * 2 + 1; this.color = 'rgba(238, 76, 44, 0.4)'; } // PyTorch Red
                update() {
                    this.x += this.vx; this.y += this.vy;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                    if (mouse.x != null) {
                        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                        let distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < mouseDistance) {
                            const force = (mouseDistance - distance) / mouseDistance;
                            this.vx += (dx / distance) * force * 0.05;
                            this.vy += (dy / distance) * force * 0.05;
                        }
                    }
                }
                draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
            }
            function init() { particles = []; for (let i = 0; i < particleCount; i++) particles.push(new Particle()); }
            function animate() {
                ctx.clearRect(0, 0, width, height);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update(); particles[i].draw();
                    for (let j = i; j < particles.length; j++) {
                        let dx = particles[i].x - particles[j].x; let dy = particles[i].y - particles[j].y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < connectionDistance) {
                            ctx.beginPath();
                            let opacity = 1 - (distance / connectionDistance);
                            ctx.strokeStyle = 'rgba(55, 117, 169, ' + opacity * 0.2 + ')'; ctx.lineWidth = 1; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }
            resize(); init(); animate();
        })();
    </script>
</body>
</html>
    `;
}
