/**
 * Hugging Face Proxy Accelerator (Ultimate Light Edition)
 * 域名: hf.w0x7ce.eu
 * 功能: 
 * 1. 智能鉴权 (Llama 2 403修复)
 * 2. 兼容 hf_transfer (Content-Length透传)
 * 3. 修复 API 500 错误
 * 4. 顶部导航栏 + 亮色粒子UI + 完整Footer
 */

const MY_DOMAIN = "hf.w0x7ce.eu"; 

const UPSTREAM_URL = "https://huggingface.co";
const UPSTREAM_LFS = "https://cdn-lfs.huggingface.co";

const PREFLIGHT_INIT = {
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

// 客户端发来的请求中需要剔除的头
const DROP_REQ_HEADERS = ['content-length', 'content-type', 'host'];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const workerUrl = `${url.protocol}//${url.hostname}`;

        // 1. 处理 CORS
        if (request.method === 'OPTIONS') return new Response(null, PREFLIGHT_INIT);

        // 2. UI 界面
        if (url.pathname === '/' || url.pathname === '/index.html') {
            return new Response(htmlPage(url.hostname), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // ================== 通用代理逻辑 ==================
        
        let targetUrlStr = "";
        let isLfsDownload = false;

        // 判断是否是 Worker 拦截后的 LFS 下载请求
        if (url.pathname.startsWith('/hfd/')) {
            // 截取 /hfd/ 之后的部分
            targetUrlStr = request.url.substring(request.url.indexOf('/hfd/') + 5);
            
            // 修正相对路径错误 (API 跳转修复)
            if (!targetUrlStr.startsWith("http")) {
                targetUrlStr = UPSTREAM_URL + targetUrlStr;
            }
            isLfsDownload = true;
        } else {
            // 常规 API 请求
            targetUrlStr = UPSTREAM_URL + url.pathname + url.search;
        }

        let targetUrl;
        try { targetUrl = new URL(targetUrlStr); } catch(e) { return new Response("Invalid URL", {status: 400}); }
        
        // 3. 构造请求头
        const newHeaders = new Headers();
        for (const [key, value] of request.headers.entries()) {
            if (!DROP_REQ_HEADERS.includes(key.toLowerCase())) {
                newHeaders.set(key, value);
            }
        }
        newHeaders.set('Host', targetUrl.hostname);
        
        // 智能鉴权处理 (Llama 2 修复)
        if (isLfsDownload) {
            // 如果是去 AWS S3 / CDN 下载大文件，必须删除 Token
            if (targetUrl.hostname.includes('cdn-lfs') || targetUrl.hostname.includes('s3') || targetUrl.hostname.includes('amazon')) {
                newHeaders.delete('Authorization');
            }
        } 
        // 常规 API 请求保留 Token

        // 4. 发起请求
        const newRequest = new Request(targetUrl, {
            method: request.method,
            headers: newHeaders,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
            redirect: 'manual' 
        });

        const response = await fetch(newRequest);
        const status = response.status;
        const responseHeaders = new Headers(response.headers);

        // 5. 拦截重定向
        const location = responseHeaders.get("Location");
        if ([301, 302, 303, 307, 308].includes(status) && location) {
            if (location.startsWith("http") && (location.includes("cdn-lfs") || location.includes("s3") || location.includes("cloudfront"))) {
                 // 外部 CDN -> 劫持
                 responseHeaders.set("Location", `${workerUrl}/hfd/${location}`);
            } else {
                 // 内部跳转 -> 保持原样
            }
            responseHeaders.set('Access-Control-Allow-Origin', '*');
            return new Response(null, { status: status, headers: responseHeaders });
        }

        // 6. 强制保留 Content-Length (hf_transfer 修复)
        const strictHeaders = new Headers(responseHeaders);
        if (response.headers.has("content-length")) {
            strictHeaders.set("Content-Length", response.headers.get("content-length"));
        }
        if (response.headers.has("content-range")) {
            strictHeaders.set("Content-Range", response.headers.get("content-range"));
        }
        
        strictHeaders.set('Access-Control-Allow-Origin', '*');

        const body = request.method === 'HEAD' ? null : response.body;

        return new Response(body, {
            status: status,
            headers: strictHeaders
        });
    }
};

// ---------------- UI 部分 (清淡亮色 + 粒子 + 导航栏 + Footer) ----------------
function htmlPage(domain) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hugging Face Proxy | w0x7ce</title>
    <style>
        :root {
            --bg: #f6f8fa; /* 浅灰背景 */
            --text-main: #24292f;
            --text-muted: #57606a;
            --accent: #FFD21E; /* HF Yellow */
            --accent-hover: #e6bd1b;
            --border: #d0d7de;
            --card-bg: rgba(255, 255, 255, 0.85);
            --cmd-bg: #f6f8fa;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; 
            background: var(--bg); 
            color: var(--text-main); 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; padding: 20px; 
            position: relative; 
            overflow: hidden;
        }

        /* 顶部导航栏 (亮色适配) */
        .nav { position: absolute; top: 20px; right: 30px; display: flex; gap: 10px; z-index: 100; flex-wrap: wrap; justify-content: flex-end; }
        .nav a { text-decoration: none; color: var(--text-muted); font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 20px; transition: all 0.2s; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.08); backdrop-filter: blur(4px); }
        .nav a:hover { background: #fff; color: #000; border-color: var(--accent); }
        .nav a.active { background: var(--accent); color: #000; box-shadow: 0 2px 8px rgba(255, 210, 30, 0.4); border-color: var(--accent); }

        /* 粒子画布 */
        #canvas-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }

        /* 主容器 (毛玻璃) */
        .container { 
            text-align: center; width: 100%; max-width: 620px; 
            background-color: var(--card-bg); 
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 12px; 
            padding: 40px; 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06); 
            position: relative; z-index: 1;
            transition: transform 0.3s ease;
        }
        .container:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08); }

        h1 { margin-bottom: 30px; font-weight: 300; font-size: 28px; }
        h1 b { color: #000; font-weight: 700; position: relative; }
        h1 b::after { content: ''; position: absolute; bottom: 2px; left: 0; width: 100%; height: 8px; background: var(--accent); z-index: -1; opacity: 0.6; border-radius: 2px;}
        
        input { 
            width: 100%; padding: 14px 18px; border-radius: 8px; border: 1px solid var(--border); 
            background: rgba(255,255,255,0.9); color: var(--text-main); font-size: 16px; outline: none; transition: all 0.2s; box-sizing: border-box; font-family: monospace; 
        }
        input:focus { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 3px rgba(255, 210, 30, 0.3); }

        .cmd { 
            margin-top: 25px; background: var(--cmd-bg); padding: 15px 20px; border-radius: 8px; border: 1px solid var(--border); 
            text-align: left; color: var(--text-main); font-family: 'SFMono-Regular', Consolas, monospace; position: relative; display: none; font-size: 14px; line-height: 1.6;
        }
        .cmd.show { display: block; animation: fadeUp 0.3s ease; }
        
        .copy-btn { 
            position: absolute; top: 12px; right: 12px; background: #fff; color: var(--text-main); border: 1px solid var(--border); padding: 4px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 500;
        }
        .copy-btn:hover { background: var(--accent); border-color: var(--accent); color: #000; }

        .tips { margin-top: 35px; color: var(--text-muted); font-size: 13px; line-height: 1.8; border-top: 1px solid var(--border); padding-top: 20px; text-align: left; }
        .tips code { background: rgba(255, 210, 30, 0.15); padding: 2px 6px; border-radius: 4px; font-family: monospace; border: 1px solid rgba(255, 210, 30, 0.2); color: #000; }

        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: var(--text-muted); position: relative; z-index: 1; }
        .footer a { text-decoration: none; color: var(--text-muted); font-weight: 600; transition: color 0.2s; }
        .footer a:hover { color: #000; text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: 2px; }
        .heart { color: #bf3989; margin: 0 4px; display: inline-block; animation: beat 1.5s infinite; }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    </style>
</head>
<body>
    <nav class="nav">
        <a href="https://pypi.w0x7ce.eu">PyPI / Torch</a>
        <a href="https://hf.w0x7ce.eu" class="active">Hugging Face</a>
        <a href="https://mirrors.w0x7ce.eu">Linux</a>
        <a href="https://github.w0x7ce.eu">GitHub</a>
        <a href="https://docker.w0x7ce.eu">Docker</a>
    </nav>

    <canvas id="canvas-bg"></canvas>

    <div class="container">
        <h1>Hugging Face <b>Proxy</b></h1>
        <input type="text" id="modelInput" placeholder="e.g. meta-llama/Llama-2-7b-hf" autocomplete="off" spellcheck="false">
        
        <div class="cmd" id="cmdBox">
            <div id="cmdText"></div>
            <button class="copy-btn" onclick="copy()">Copy</button>
        </div>

        <div class="tips">
            <p>💡 推荐使用官方高速下载器 (多线程/断点续传):</p>
            <p>1. <code>pip install hf_transfer</code></p>
            <p>2. <code>export HF_HUB_ENABLE_HF_TRANSFER=1</code></p>
        </div>
    </div>

    <div class="footer">
        Made with <span class="heart">❤</span> by <a href="https://github.com/tianrking" target="_blank">w0x7ce</a>
    </div>

    <script>
        const domain = "${domain}";
        const input = document.getElementById('modelInput');
        const cmdBox = document.getElementById('cmdBox');
        const cmdText = document.getElementById('cmdText');
        
        input.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (!val) { cmdBox.classList.remove('show'); return; }
            if (val.length < 3 || !val.includes('/')) { cmdBox.classList.remove('show'); return; }

            cmdText.innerHTML = \`export HF_ENDPOINT=https://\${domain}<br>huggingface-cli download \${val}\`;
            cmdBox.classList.add('show');
        });

        function copy() {
            navigator.clipboard.writeText(cmdText.innerText);
            const btn = document.querySelector('.copy-btn');
            const original = btn.textContent;
            btn.textContent = "已复制!";
            btn.style.backgroundColor = "#FFD21E";
            btn.style.borderColor = "#FFD21E";
            setTimeout(() => { 
                btn.textContent = original; 
                btn.style.backgroundColor = ""; 
                btn.style.borderColor = "";
            }, 2000);
        }

        // --- 亮色粒子特效 ---
        (function() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let width, height; let particles = [];
            const particleCount = 50; 
            const connectionDistance = 140; 
            
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
                draw() { ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
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
                            ctx.strokeStyle = \`rgba(0,0,0,\${(1 - distance/connectionDistance) * 0.06})\`;
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