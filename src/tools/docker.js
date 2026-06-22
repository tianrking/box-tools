import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";

/**
 * Docker Proxy Accelerator (Ultimate Edition)
 * 路径: /docker UI, /v2 registry API
 * 功能: 
 * 1. 修复 AWS S3 签名错误 (Blob Proxy)
 * 2. 自动补全 library (nginx -> library/nginx)
 * 3. 顶部导航栏互联
 * 4. 粒子特效 UI
 */

const PREFLIGHT_INIT = {
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
};

// 屏蔽的爬虫 UA
const BLOCK_UA = ['netcraft', 'baiduspider', 'bingbot', 'sogou', '360spider'];

// 镜像仓库路由表 (支持前缀映射)
const ROUTES = {
    "docker": "https://registry-1.docker.io",
    "quay": "https://quay.io",
    "gcr": "https://gcr.io",
    "k8s-gcr": "https://k8s.gcr.io",
    "k8s": "https://registry.k8s.io",
    "ghcr": "https://ghcr.io",
    "cloudsmith": "https://docker.cloudsmith.io",
    "nvcr": "https://nvcr.io"
};

const DEFAULT_UPSTREAM = "https://registry-1.docker.io";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const userAgent = (request.headers.get('User-Agent') || "").toLowerCase();
        const workerUrl = getToolBaseUrl(request, "docker");

        // 1. 处理 CORS
        if (request.method === 'OPTIONS') return new Response(null, PREFLIGHT_INIT);

        // 2. 防爬虫
        if (BLOCK_UA.some(ua => userAgent.includes(ua))) return new Response("403 Forbidden", { status: 403 });

        // 3. 【核心修复】Blob 专用代理通道
        // 解决 S3 重定向后，Docker 客户端带 Authorization 头导致 400/403 的问题
        if (url.pathname === '/_worker_blob_proxy') {
            const targetUrl = url.searchParams.get('url');
            if (!targetUrl) return new Response("Missing URL", { status: 400 });

            const newHeaders = new Headers(request.headers);
            // 清理敏感 Header
            newHeaders.delete('Authorization');
            newHeaders.delete('Host');
            newHeaders.delete('Cookie');
            
            const blobRequest = new Request(targetUrl, {
                method: request.method,
                headers: newHeaders,
                body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
                redirect: 'follow'
            });
            return fetch(blobRequest);
        }

        // 4. UI 界面
        if (url.pathname === '/' || url.pathname === '/index.html') {
            return new Response(htmlPage(request), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        if (url.pathname === '/favicon.ico') return new Response(null, { status: 404 });

        // 5. 路由解析逻辑
        let upstream = DEFAULT_UPSTREAM;
        let pathParts = url.pathname.split('/');
        let potentialRoute = pathParts[1]; // 获取第一个路径段，如 /quay/...
        
        if (ROUTES[potentialRoute]) {
            // 命中路由表 (例如 quay, gcr)
            upstream = ROUTES[potentialRoute];
            url.pathname = url.pathname.replace(`/${potentialRoute}`, '');
        } else {
            // 默认为 Docker Hub，处理 Token 和 Library 补全
            if (url.pathname.includes('/token')) {
                const tokenUrl = new URL("https://auth.docker.io" + url.pathname + url.search);
                const scope = tokenUrl.searchParams.get('scope');
                // 自动补全 library 权限 (pull nginx -> pull library/nginx)
                if (scope) {
                    const scopeParts = scope.split(':');
                    if (scopeParts.length === 3 && scopeParts[0] === 'repository' && !scopeParts[1].includes('/')) {
                        const newScope = `repository:library/${scopeParts[1]}:${scopeParts[2]}`;
                        tokenUrl.searchParams.set('scope', newScope);
                    }
                }
                return fetch(new Request(tokenUrl, request));
            }
            
            // 自动补全 library 路径
            // 匹配 /v2/nginx/manifests/... -> /v2/library/nginx/manifests/...
            const isSingleWordImage = url.pathname.match(/^\/v2\/([^/]+)\/(manifests|blobs|tags)/);
            if (isSingleWordImage && !isSingleWordImage[1].includes('/')) {
                url.pathname = url.pathname.replace(/^\/v2\//, '/v2/library/');
            }
        }

        // 6. 构造上游请求
        const newUrl = new URL(upstream + url.pathname + url.search);
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Host', newUrl.hostname);
        newHeaders.set('Referer', newUrl.origin);
        newHeaders.set('Connection', 'keep-alive'); 

        const newRequest = new Request(newUrl, {
            method: request.method,
            headers: newHeaders,
            body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.blob() : null,
            redirect: 'manual' // 手动处理重定向
        });

        // 7. 发起请求
        const response = await fetch(newRequest);
        const responseHeaders = new Headers(response.headers);
        const status = response.status;

        // 8. 修改 Www-Authenticate 头 (指向 Worker)
        const authHeader = responseHeaders.get("Www-Authenticate");
        if (authHeader) {
            responseHeaders.set("Www-Authenticate", authHeader.replace(/realm="([^"]+)"/, `realm="${workerUrl}/token"`));
        }

        // 9. 【核心修复】拦截 S3 重定向
        const locationHeader = responseHeaders.get("Location");
        if (locationHeader && (status === 301 || status === 302 || status === 307)) {
            // 将 S3 链接作为参数传给 _worker_blob_proxy
            const encodedUrl = encodeURIComponent(locationHeader);
            const proxyRedirectUrl = `${workerUrl}/_worker_blob_proxy?url=${encodedUrl}`;
            responseHeaders.set("Location", proxyRedirectUrl);
        }

        // 10. CORS & 返回
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(response.body, {
            status: status,
            headers: responseHeaders
        });
    }
};

// -----------------------------------------------------------
// 现代版 UI (粒子背景 + 毛玻璃 + 导航栏)
// -----------------------------------------------------------
function htmlPage(request) {
    const registryHost = getDockerRegistryHost(request);
    const nav = renderToolNav(request, "docker");
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docker Proxy Accelerator | w0x7ce</title>
    <style>
        :root { 
            --text-main: #24292f; 
            --text-muted: #57606a; 
            --accent: #0969da; 
            --btn-bg: #0369a1; /* accessible Docker Blue */
            --btn-hover: #075985;
            --border: #d0d7de; 
            --cmd-bg: #161b22; 
            --cmd-text: #7ee787; 
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; 
            color: var(--text-main); 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            flex-direction: column; 
            overflow: hidden; 
            position: relative; 
            background: #f0f2f5; 
        }

        /* 顶部导航栏 */
        .nav { 
            position: absolute; 
            top: 20px; 
            right: 30px; 
            display: flex; 
            gap: 10px; 
            z-index: 100;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        .nav a { 
            text-decoration: none; 
            color: #57606a; 
            font-size: 13px; 
            font-weight: 600; 
            padding: 6px 14px; 
            border-radius: 20px; 
            transition: all 0.2s; 
            background: rgba(255,255,255,0.6); 
            border: 1px solid rgba(0,0,0,0.08); 
            backdrop-filter: blur(4px); 
        }
        .nav a:hover { 
            color: var(--accent); 
            background: #fff; 
        }
        .nav a.active { 
            background: var(--btn-bg); 
            color: #fff; 
            border-color: var(--btn-bg); 
            box-shadow: 0 2px 8px rgba(13, 183, 237, 0.3); 
        }

        #canvas-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; }
        
        .container { 
            width: 100%; 
            max-width: 680px; 
            background-color: rgba(255, 255, 255, 0.85); 
            backdrop-filter: blur(12px); 
            -webkit-backdrop-filter: blur(12px); 
            border: 1px solid rgba(255, 255, 255, 0.5); 
            border-radius: 12px; 
            padding: 40px; 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
            text-align: center; 
            position: relative; 
            z-index: 1; 
            transition: transform 0.3s ease; 
        }
        .container:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12); }
        
        .header { margin-bottom: 30px; }
        .logo { width: 64px; height: 64px; margin-bottom: 15px; fill: #0369a1; }
        h1 { font-size: 24px; font-weight: 300; letter-spacing: -0.5px; margin: 0; }
        h1 b { font-weight: 600; color: #0369a1; }
        
        .input-group { margin-bottom: 25px; text-align: left; position: relative; }
        label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: var(--text-main); }
        input[type="text"] { 
            width: 100%; 
            padding: 12px 14px; 
            background-color: rgba(255,255,255,0.8); 
            border: 1px solid var(--border); 
            border-radius: 6px; 
            font-size: 16px; 
            color: var(--text-main); 
            outline: none; 
            transition: all 0.2s; 
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); 
        }
        input[type="text"]:focus { 
            background-color: #fff; 
            border-color: var(--accent); 
            box-shadow: 0 0 0 3px rgba(13, 183, 237, 0.3); 
        }
        
        .result-box { 
            background-color: var(--cmd-bg); 
            border-radius: 8px; 
            padding: 16px; 
            margin-top: 20px; 
            text-align: left; 
            position: relative; 
            display: none; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.15); 
            border: 1px solid rgba(255,255,255,0.1); 
        }
        .result-box.show { display: block; animation: slideDown 0.3s ease-out; }
        
        .cmd-label { font-size: 12px; color: #8b949e; margin-bottom: 6px; display: block; }
        .cmd-text { font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; color: var(--cmd-text); font-size: 14px; word-break: break-all; line-height: 1.5; padding-right: 60px; }
        .example-pair { margin-top: 16px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; text-align: left; background: rgba(255,255,255,0.72); }
        .example-row { display: grid; grid-template-columns: 96px minmax(0,1fr); gap: 10px; padding: 10px 12px; border-top: 1px solid var(--border); align-items: center; }
        .example-row:first-child { border-top: 0; }
        .example-row span { color: var(--text-muted); font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .example-row code { color: var(--text-main); font-size: 12px; word-break: break-all; }
        
        .copy-btn { 
            position: absolute; top: 50%; right: 12px; transform: translateY(-50%); 
            background-color: var(--btn-bg); color: white; 
            border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; 
            padding: 6px 12px; cursor: pointer; font-size: 13px; font-weight: 600; 
            transition: all 0.2s; 
            box-shadow: 0 1px 0 rgba(0,0,0,0.1); 
        }
        .copy-btn:hover { background-color: var(--btn-hover); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .copy-btn:active { transform: translateY(-50%) scale(0.96); }
        
        .tips { margin-top: 30px; font-size: 13px; color: var(--text-muted); text-align: left; border-top: 1px solid var(--border); padding-top: 20px; }
        .tips p { margin-bottom: 8px; display: flex; align-items: center; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; margin-right: 8px; background: #e1f6fc; color: #075985; border: 1px solid rgba(7, 89, 133, 0.22); }
        
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
            <svg class="logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.119a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V3.574a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V3.574a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.186.186.186m5.893 2.715h2.119a.186.186 0 00.186-.185V6.29a.186.186 0 00-.186-.185h-2.119a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V6.29a.185.185 0 00-.184-.185H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m-2.929 0h2.12a.185.185 0 00.184-.185V6.29a.185.185 0 00-.184-.185H2.207a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V6.29a.185.185 0 00-.185-.185H-.757a.186.186 0 00-.186.185v1.888c0 .102.083.185.186.185m15.633 6.05v-.905h-9.98c-.534 0-1.066-.007-1.597.054-1.93.22-3.156 1.788-3.413 3.616-.2 1.424-.037 3.55 1.446 4.67 1.188.898 2.827.874 4.244.874 2.659-.001 5.318-.003 7.977-.001.325 0 .736.098.92-.258.125-.242.067-.558.067-.824v-6.304c0-.302.032-.596.342-.922"/></svg>
            <h1>Docker <b>Accelerator</b></h1>
        </div>
        
        <div class="input-group">
            <label>Pull Image (自动识别多源)</label>
            <input type="text" id="urlInput" placeholder="例如: nginx:latest 或 quay.io/coreos/etcd" autocomplete="off" spellcheck="false">
        </div>

        <div class="result-box" id="resultBox">
            <span class="cmd-label">Terminal Command:</span>
            <div class="cmd-text" id="cmdText"></div>
            <button class="copy-btn" onclick="copyCmd()">复制</button>
        </div>
        <div class="example-pair">
            <div class="example-row"><span>Original</span><code>docker pull nginx:latest</code></div>
            <div class="example-row"><span>Accelerated</span><code>docker pull ${registryHost}/library/nginx:latest</code></div>
            <div class="example-row"><span>Quay</span><code>docker pull ${registryHost}/quay/coreos/etcd:latest</code></div>
        </div>

        <div class="tips">
            <p><span class="badge">DOCKER</span> 默认为 Docker Hub，支持 <code>library/</code> 自动补全</p>
            <p><span class="badge">MULTI</span> 支持 <code>gcr.io</code>, <code>quay.io</code>, <code>k8s.gcr.io</code> 等前缀路由</p>
            <p><span class="badge">SECURE</span> 自动修复 AWS S3 签名与 401 认证错误</p>
        </div>
    </div>

    <div class="footer">
        Made with <span class="heart">❤</span> by <a href="https://github.com/tianrking" target="_blank">w0x7ce</a>
    </div>

    <script>
        const registryHost = "${registryHost}";
        const input = document.getElementById('urlInput');
        const resultBox = document.getElementById('resultBox');
        const cmdText = document.getElementById('cmdText');
        
        input.addEventListener('input', function() {
            const val = this.value.trim();
            if (!val) { resultBox.classList.remove('show'); return; }
            let cleanVal = val.replace(/^docker pull\\s+/, '');
            
            let finalImage = "";
            const routes = {"quay.io": "quay", "gcr.io": "gcr", "k8s.gcr.io": "k8s-gcr", "registry.k8s.io": "k8s", "ghcr.io": "ghcr", "nvcr.io": "nvcr"};
            
            let matchedRoute = false;
            for (let [domainKey, prefix] of Object.entries(routes)) {
                if (cleanVal.startsWith(domainKey)) {
                    finalImage = registryHost + "/" + prefix + cleanVal.substring(domainKey.length);
                    matchedRoute = true;
                    break;
                }
            }
            if (!matchedRoute) {
                // 处理 docker.io 前缀或无前缀
                let img = cleanVal.replace(/^docker\\.io\\//, '');
                finalImage = registryHost + "/" + img;
            }
            
            cmdText.textContent = "docker pull " + finalImage;
            resultBox.classList.add('show');
        });

        function copyCmd() {
            const text = cmdText.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = "已复制!";
                btn.style.backgroundColor = "#2da44e"; // Green for success
                setTimeout(() => { btn.textContent = originalText; btn.style.backgroundColor = ""; }, 2000);
            });
        }

        // --- 粒子特效逻辑 ---
        (function() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let width, height; let particles = [];
            const particleCount = 50; const connectionDistance = 140; const mouseDistance = 200; 
            let mouse = { x: null, y: null };

            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
            window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
            function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }

            class Particle {
                constructor() { 
                    this.x = Math.random() * width; this.y = Math.random() * height; 
                    this.vx = (Math.random() - 0.5) * 1.5; this.vy = (Math.random() - 0.5) * 1.5; 
                    this.size = Math.random() * 2 + 1; 
                    this.color = 'rgba(13, 183, 237, 0.4)'; // Docker Blue
                }
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
                            ctx.strokeStyle = 'rgba(13, 183, 237, ' + opacity * 0.2 + ')'; ctx.lineWidth = 1; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
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
