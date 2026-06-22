import { getToolBaseUrl, renderToolNav } from "../navigation.js";

/**
 * Universal Linux Mirrors Proxy (Light & Fresh Edition)
 * 路径: /mirrors
 * 模式: 纯粹透传 (Pass-through)
 * 适配: APT, YUM, DNF, Pacman, Wget, Curl, Browser
 * 风格: 亮色紫罗兰 + 粒子特效
 */

// 预检请求配置
const PREFLIGHT_INIT = {
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

// 剔除 Cloudflare 特有头部，伪装成直接请求
const DROP_HEADERS = ['cf-connecting-ip', 'cf-ipcountry', 'x-forwarded-for', 'cf-ray', 'cf-visitor', 'cf-worker'];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const workerUrl = getToolBaseUrl(request, "mirrors");

        // 1. 处理 CORS 预检
        if (request.method === 'OPTIONS') return new Response(null, PREFLIGHT_INIT);

        // 2. 首页 UI (多功能生成器)
        if (url.pathname === '/' || url.pathname === '/index.html') {
            return new Response(htmlPage(request), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        if (url.pathname === '/favicon.ico') return new Response(null, { status: 404 });

        // ================== 核心通用代理逻辑 ==================

        // 解析目标 URL: 截取域名后的所有内容
        let targetUrlStr = url.pathname.substring(1) + url.search;

        // 格式校验
        if (!targetUrlStr.startsWith("http")) {
            return new Response(`Invalid URL format. Usage: ${workerUrl}/https://target.com/file`, { status: 400 });
        }

        try {
            const targetUrl = new URL(targetUrlStr);
            
            // 3. 构造请求头 (透传模式)
            const newHeaders = new Headers();
            for (const [key, value] of request.headers.entries()) {
                if (!DROP_HEADERS.includes(key.toLowerCase())) {
                    newHeaders.set(key, value);
                }
            }
            // 核心：伪装 Host 和 Referer
            newHeaders.set('Host', targetUrl.hostname);
            newHeaders.set('Referer', targetUrl.origin);

            // 4. 发起请求
            const newRequest = new Request(targetUrl, {
                method: request.method,
                headers: newHeaders,
                body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
                redirect: 'manual' 
            });

            const response = await fetch(newRequest);
            const responseHeaders = new Headers(response.headers);
            const status = response.status;

            // 5. 智能重定向劫持
            const location = responseHeaders.get("Location");
            if ([301, 302, 303, 307, 308].includes(status) && location) {
                if (location.startsWith("http")) {
                    responseHeaders.set("Location", `${workerUrl}/${location}`);
                } else {
                    const absoluteLocation = new URL(location, targetUrl).href;
                    responseHeaders.set("Location", `${workerUrl}/${absoluteLocation}`);
                }
            }

            // 6. 允许跨域 & 返回
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            
            return new Response(response.body, {
                status: status,
                headers: responseHeaders
            });

        } catch (e) {
            return new Response("Proxy Error: " + e.message, { status: 502 });
        }
    }
};

// ---------------- UI 部分 (清淡紫罗兰 + 导航栏) ----------------
function htmlPage(request) {
    const baseUrl = getToolBaseUrl(request, "mirrors");
    const nav = renderToolNav(request, "mirrors");
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Mirrors | w0x7ce</title>
    <style>
        :root {
            --bg: #f8fafc; /* 极简灰白 */
            --text-main: #1e293b;
            --text-muted: #64748b;
            --accent: #8b5cf6; /* Violet */
            --accent-hover: #7c3aed;
            --card-bg: rgba(255, 255, 255, 0.85);
            --border: #e2e8f0;
            --cmd-bg: #f1f5f9;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            background: var(--bg); 
            color: var(--text-main); 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; padding: 20px; 
            position: relative; 
            overflow: hidden;
        }
        
        /* 顶部导航栏 */
        .nav { position: absolute; top: 20px; right: 30px; display: flex; gap: 10px; z-index: 100; flex-wrap: wrap; justify-content: flex-end; }
        .nav a { text-decoration: none; color: var(--text-muted); font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; transition: all 0.2s; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(4px); }
        .nav a:hover { color: #000; background: #fff; border-color: var(--accent); }
        .nav a.active { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3); }

        .container { width: 100%; max-width: 680px; position: relative; z-index: 1; }
        
        /* 粒子背景 */
        #canvas-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }

        /* 主卡片 */
        .card-wrap {
            background-color: var(--card-bg);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            text-align: center;
            transition: transform 0.3s ease;
        }
        .card-wrap:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08); }

        .header { margin-bottom: 35px; }
        .logo { width: 64px; height: 64px; fill: var(--accent); margin-bottom: 15px; filter: drop-shadow(0 4px 6px rgba(139, 92, 246, 0.2)); }
        h1 { font-weight: 300; letter-spacing: -0.5px; margin: 0; font-size: 28px; }
        h1 b { font-weight: 700; color: var(--accent); }
        .subtitle { color: var(--text-muted); font-size: 14px; margin-top: 8px; font-weight: 500; }
        .repo-badge {
            display: inline-flex; background: #ede9fe; color: #5b21b6;
            border: 1px solid #ddd6fe; border-radius: 999px;
            padding: 7px 12px; margin-bottom: 14px;
            font-size: 12px; font-weight: 900; text-transform: uppercase;
        }
        .distro-grid {
            display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px; margin: 24px 0 24px;
        }
        .distro-card {
            background: #fff; border: 1px solid var(--border);
            border-radius: 10px; padding: 12px 8px; text-align: center;
        }
        .distro-card strong { display: block; color: #312e81; font-size: 13px; margin-bottom: 4px; }
        .distro-card span { color: var(--text-muted); font-size: 11px; line-height: 1.4; }

        .input-group { position: relative; margin-bottom: 30px; }
        input { 
            width: 100%; padding: 16px 20px; border-radius: 10px; border: 1px solid var(--border); 
            background: rgba(255, 255, 255, 0.9); color: var(--text-main); font-size: 16px; outline: none; 
            transition: all 0.2s; box-sizing: border-box; font-family: 'Consolas', monospace; 
        }
        input:focus { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
        input::placeholder { color: #94a3b8; }
        .example-pair { margin: -12px 0 24px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; text-align: left; background: #fff; }
        .example-row { display: grid; grid-template-columns: 104px minmax(0,1fr); gap: 10px; padding: 10px 12px; border-top: 1px solid var(--border); align-items: center; }
        .example-row:first-child { border-top: 0; }
        .example-row span { color: var(--text-muted); font-size: 12px; font-weight: 800; text-transform: uppercase; }
        .example-row code { color: var(--text-main); font-size: 12px; word-break: break-all; }
        
        .result-area {
            opacity: 0; transform: translateY(10px); transition: all 0.3s ease;
            pointer-events: none; visibility: hidden;
        }
        .result-area.show { opacity: 1; transform: translateY(0); pointer-events: all; visibility: visible; }

        .result-tabs { display: flex; gap: 8px; margin-bottom: 12px; justify-content: center; }
        .tab { 
            font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; cursor: pointer; 
            padding: 6px 12px; border-radius: 6px; transition: all 0.2s; background: transparent;
        }
        .tab:hover { color: var(--accent); background: rgba(139, 92, 246, 0.05); }
        .tab.active { color: var(--accent); background: rgba(139, 92, 246, 0.1); }

        .result-card { 
            background: var(--cmd-bg); border-radius: 10px; padding: 20px; border: 1px solid var(--border); 
            position: relative; display: none; text-align: left; 
        }
        .result-card.active { display: block; animation: fadeUp 0.3s ease; }
        
        code { font-family: 'Consolas', monospace; color: #334155; word-break: break-all; font-size: 14px; line-height: 1.6; display: block; }
        .comment { color: #94a3b8; user-select: none; }

        .copy-btn { 
            position: absolute; top: 15px; right: 15px; 
            background: #fff; color: var(--text-muted); border: 1px solid var(--border); 
            padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 600;
        }
        .copy-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; }
        .footer a { color: #475569; font-weight: 700; }
        .heart { color: #be123c; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 640px) {
            body { justify-content: flex-start; padding-top: 96px; overflow-y: auto; }
            .card-wrap { padding: 28px 18px; }
            .distro-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
    </style>
</head>
<body>
    ${nav}

    <canvas id="canvas-bg"></canvas>

    <div class="container">
        <div class="card-wrap">
            <div class="header">
                <svg class="logo" viewBox="0 0 24 24"><path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5M12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15M5 15.91L11 19.29V12.58L5 9.21V15.91M19 15.91V9.21L13 12.58V19.29L19 15.91Z"/></svg>
                <div class="repo-badge">Linux repository accelerator</div>
                <h1>Universal <b>Mirrors</b></h1>
                <div class="subtitle">APT / YUM / DNF / Wget 透传加速</div>
            </div>

            <div class="distro-grid">
                <div class="distro-card"><strong>Ubuntu</strong><span>APT sources</span></div>
                <div class="distro-card"><strong>Debian</strong><span>packages</span></div>
                <div class="distro-card"><strong>CentOS</strong><span>YUM repo</span></div>
                <div class="distro-card"><strong>Arch</strong><span>Pacman URL</span></div>
            </div>
            
            <div class="input-group">
                <input type="text" id="target" placeholder="粘贴源地址 (如 http://archive.ubuntu.com/ubuntu)" autocomplete="off">
            </div>
            <div class="example-pair">
                <div class="example-row"><span>Original</span><code>deb http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse</code></div>
                <div class="example-row"><span>Accelerated</span><code>deb ${baseUrl}/http://archive.ubuntu.com/ubuntu jammy main restricted universe multiverse</code></div>
            </div>

            <div class="result-area" id="resultArea">
                <div class="result-tabs">
                    <div class="tab active" onclick="switchTab('apt', event)">APT (Ubuntu)</div>
                    <div class="tab" onclick="switchTab('yum', event)">YUM (CentOS)</div>
                    <div class="tab" onclick="switchTab('wget', event)">Wget / Curl</div>
                </div>

                <div class="result-card active" id="card-apt">
                    <code id="code-apt"></code>
                    <button class="copy-btn" onclick="copy('code-apt')">复制</button>
                </div>

                <div class="result-card" id="card-yum">
                    <code id="code-yum"></code>
                    <button class="copy-btn" onclick="copy('code-yum')">复制</button>
                </div>

                <div class="result-card" id="card-wget">
                    <code id="code-wget"></code>
                    <button class="copy-btn" onclick="copy('code-wget')">复制</button>
                </div>
            </div>
        </div>

        <div class="footer">
        Made with <span class="heart">❤</span> by <a href="https://github.com/tianrking" target="_blank">w0x7ce</a>
        </div>
    </div>

    <script>
        const baseUrl = "${baseUrl}";
        const input = document.getElementById('target');
        const resultArea = document.getElementById('resultArea');
        
        function updateResult() {
            const val = input.value.trim();
            if (!val || val.length < 4 || !val.includes('.')) { resultArea.classList.remove('show'); return; }

            resultArea.classList.add('show');
            const proxyUrl = \`${baseUrl}/\${val}\`;

            document.getElementById('code-apt').innerHTML = 
                \`<span class="comment"># /etc/apt/sources.list</span><br>deb \${proxyUrl} jammy main restricted universe multiverse\`;
            
            document.getElementById('code-yum').innerHTML = 
                \`<span class="comment"># /etc/yum.repos.d/xxx.repo</span><br>baseurl=\${proxyUrl}\`;

            document.getElementById('code-wget').innerHTML = 
                \`wget \${proxyUrl}\`;
        }

        input.addEventListener('input', updateResult);

        function switchTab(type, event) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.result-card').forEach(c => c.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById('card-' + type).classList.add('active');
        }

        function copy(id) {
            const text = document.getElementById(id).innerText;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('#' + id + ' + .copy-btn');
                const original = btn.textContent;
                btn.textContent = "已复制";
                btn.style.background = "#8b5cf6";
                btn.style.color = "#fff";
                btn.style.borderColor = "#8b5cf6";
                setTimeout(() => { 
                    btn.textContent = original; 
                    btn.style.background = ""; 
                    btn.style.color = "";
                    btn.style.borderColor = "";
                }, 2000);
            });
        }

        // --- 亮色紫罗兰粒子特效 ---
        (function() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let width, height; let particles = [];
            const particleCount = 50; 
            const connectionDistance = 150; 
            
            function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
            window.addEventListener('resize', resize);
            resize();

            class Particle {
                constructor() { 
                    this.x = Math.random() * width; this.y = Math.random() * height; 
                    this.vx = (Math.random() - 0.5) * 0.8; this.vy = (Math.random() - 0.5) * 0.8; 
                    this.size = Math.random() * 2 + 1; 
                }
                update() {
                    this.x += this.vx; this.y += this.vy;
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;
                }
                // 浅紫色/灰色粒子
                draw() { ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
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
                            // 浅紫色连线
                            ctx.strokeStyle = \`rgba(139, 92, 246, \${(1 - distance/connectionDistance) * 0.1})\`;
                            ctx.lineWidth = 1; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }
            init(); animate();
        })();
    </script>
</body>
</html>
    `;
}
