import { hasNativeHtmlRewriter, rewriteHtmlAttributes, rewriteHtmlResponse } from "../html.js";
import { getToolBaseUrl, renderToolNav } from "../navigation.js";

/**
 * GitHub Proxy Accelerator (Modern Edition + Nav)
 * 路径: /github
 * 作者: w0x7ce
 * 风格: GitHub Light + 现代粒子交互 + 毛玻璃特效 + 胶囊导航
 */

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const workerBaseUrl = getToolBaseUrl(request, "github");

  // 1. 根目录返回现代 UI 界面
  if (path === "/" || path === "/index.html") {
    return new Response(htmlPage(request), {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  // 2. 智能路径解析
  // 逻辑：/username/repo -> https://github.com/username/repo
  let targetUrlStr = path.substring(1) + url.search + url.hash;

  if (targetUrlStr.startsWith("https://") || targetUrlStr.startsWith("http://")) {
    // 完整链接，保持原样
  } else if (targetUrlStr.startsWith("github.com/")) {
    targetUrlStr = "https://" + targetUrlStr;
  } else {
    // 简写模式 (默认指向 github.com)
    targetUrlStr = "https://github.com/" + targetUrlStr;
  }

  // 3. 验证 URL
  let targetUrl;
  try {
    targetUrl = new URL(targetUrlStr);
  } catch (e) {
    return new Response("Invalid URL", { status: 400 });
  }

  // 4. 构造 Headers
  const newHeaders = new Headers(request.headers);
  newHeaders.set("Host", targetUrl.hostname);
  newHeaders.set("Referer", targetUrl.origin);
  newHeaders.delete("Cookie");

  const fetchOptions = {
    method: request.method,
    headers: newHeaders,
    redirect: "manual",
    body: request.body
  };

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);

    // 5. 处理重定向
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("Location");
      if (location) {
        const newLocation = new URL(location, targetUrl).href;
        const proxyLocation = workerBaseUrl + "/" + newLocation;
        return new Response(null, {
          status: response.status,
          headers: { "Location": proxyLocation }
        });
      }
    }

    // 6. 网页浏览优化 (HTMLRewriter)
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("text/html")) {
      if (!hasNativeHtmlRewriter()) {
        return rewriteHtmlResponse(response, (html) => rewriteHtmlForNode(html, workerBaseUrl));
      }
      return rewriter(workerBaseUrl).transform(response);
    }

    // 7. 核心加速：流式传输
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

  } catch (e) {
    return new Response("Proxy Error: " + e.message, { status: 500 });
  }
}

// -----------------------------------------------------------
// HTMLRewriter
// -----------------------------------------------------------
class AttributeRewriter {
  constructor(attributeName, workerOrigin) {
    this.attributeName = attributeName;
    this.workerOrigin = workerOrigin;
  }
  element(element) {
    const attribute = element.getAttribute(this.attributeName);
    if (attribute && !attribute.startsWith("#") && !attribute.startsWith("javascript:") && !attribute.startsWith("data:")) {
      if (attribute.startsWith("http")) {
         element.setAttribute(this.attributeName, this.workerOrigin + "/" + attribute);
      } else if (attribute.startsWith("/")) {
         element.setAttribute(this.attributeName, this.workerOrigin + "/https://github.com" + attribute);
      }
    }
  }
}

function rewriter(workerOrigin) {
  return new HTMLRewriter()
    .on("a", new AttributeRewriter("href", workerOrigin))
    .on("img", new AttributeRewriter("src", workerOrigin))
    .on("link", new AttributeRewriter("href", workerOrigin))
    .on("script", new AttributeRewriter("src", workerOrigin));
}

function rewriteHtmlForNode(html, workerOrigin) {
  return rewriteHtmlAttributes(html, (attribute, value) => {
    if (
      !value ||
      value.startsWith("#") ||
      value.startsWith("javascript:") ||
      value.startsWith("data:") ||
      value.startsWith("mailto:")
    ) {
      return value;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      return `${workerOrigin}/${value}`;
    }

    if (value.startsWith("/")) {
      return `${workerOrigin}/https://github.com${value}`;
    }

    return value;
  });
}

// -----------------------------------------------------------
// 现代版 UI (粒子背景 + 毛玻璃 + 导航栏)
// -----------------------------------------------------------
function htmlPage(request) {
    const baseUrl = getToolBaseUrl(request, "github");
    const nav = renderToolNav(request, "github");
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub 加速通道 | w0x7ce</title>
    <link rel="icon" href="https://github.githubassets.com/favicons/favicon.svg">
    <style>
        :root {
            --text-main: #24292f;
            --text-muted: #57606a;
            --accent: #0969da;
            --btn-bg: #2da44e;
            --btn-hover: #2c974b;
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
            overflow: hidden; /* 防止滚动条 */
            position: relative;
            background: #f0f2f5; /* 备用背景色 */
        }

        /* === 新增：顶部导航栏 === */
        .nav { 
            position: absolute; 
            top: 20px; 
            right: 30px; 
            display: flex; 
            gap: 10px; 
            z-index: 100; /* 确保在最上层 */
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
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .nav a.active { 
            background: var(--btn-bg); /* GitHub Green */
            color: #fff; 
            border-color: var(--btn-bg); 
            box-shadow: 0 2px 8px rgba(45, 164, 78, 0.3); 
        }
        /* ======================== */

        /* 粒子画布背景 */
        #canvas-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
        }

        /* 主容器 - 毛玻璃效果 */
        .container { 
            width: 100%; 
            max-width: 620px; 
            background-color: rgba(255, 255, 255, 0.85); /* 半透明白 */
            backdrop-filter: blur(12px); /* 核心：毛玻璃模糊 */
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 12px; 
            padding: 40px; 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); 
            text-align: center; 
            position: relative; 
            z-index: 1; /* 保证在画布之上 */
            transition: transform 0.3s ease;
        }
        
        .container:hover {
            transform: translateY(-2px); /* 悬停微浮 */
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .header { margin-bottom: 30px; }
        .logo { width: 56px; height: 56px; margin-bottom: 15px; fill: #24292f; }
        h1 { font-size: 24px; font-weight: 300; letter-spacing: -0.5px; margin: 0; }
        h1 b { font-weight: 600; }
        
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
            box-shadow: 0 0 0 3px rgba(9,105,218,0.3); 
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
            border: 1px solid rgba(27,31,36,0.15); border-radius: 6px; 
            padding: 6px 12px; cursor: pointer; font-size: 13px; font-weight: 600; 
            transition: all 0.2s; 
            box-shadow: 0 1px 0 rgba(27,31,36,0.1);
        }
        .copy-btn:hover { background-color: var(--btn-hover); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .copy-btn:active { transform: translateY(-50%) scale(0.96); }

        .tips { margin-top: 30px; font-size: 13px; color: var(--text-muted); text-align: left; border-top: 1px solid var(--border); padding-top: 20px; }
        .tips p { margin-bottom: 8px; display: flex; align-items: center; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 8px; background: #dafbe1; color: #1a7f37; border: 1px solid rgba(27,31,36,0.04); }
        
        .footer { 
            margin-top: 30px; 
            font-size: 13px; 
            color: rgba(36, 41, 47, 0.6); 
            text-align: center; 
            position: relative; 
            z-index: 1; 
            text-shadow: 0 1px 0 rgba(255,255,255,0.5);
        }
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
            <svg class="logo" viewBox="0 0 16 16" version="1.1" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
            <h1>GitHub <b>Accelerator</b></h1>
        </div>
        
        <div class="input-group">
            <label>Repo 地址 (支持简写)</label>
            <input type="text" id="urlInput" placeholder="e.g. vercel/next.js or https://github.com/vercel/next.js" autocomplete="off" spellcheck="false">
        </div>

        <div class="result-box" id="resultBox">
            <span class="cmd-label">Terminal Command:</span>
            <div class="cmd-text" id="cmdText"></div>
            <button class="copy-btn" onclick="copyCmd()">复制</button>
        </div>
        <div class="example-pair">
            <div class="example-row"><span>Original</span><code>git clone https://github.com/vercel/next.js.git</code></div>
            <div class="example-row"><span>Accelerated</span><code>git clone ${baseUrl}/vercel/next.js.git</code></div>
        </div>

        <div class="tips">
            <p><span class="badge">CLONE</span> 输入 <code>vercel/next.js</code> 自动生成命令</p>
            <p><span class="badge">BROWSE</span> 链接可直接访问，支持 Releases / Raw</p>
            <p><span class="badge">FAST</span> 边缘节点流式传输，无大小限制</p>
        </div>
    </div>

    <div class="footer">
        Made with <span class="heart">❤</span> by <a href="https://github.com/w0x7ce" target="_blank">w0x7ce</a>
    </div>

    <script>
        // 核心逻辑
        const baseUrl = "${baseUrl}";
        const input = document.getElementById('urlInput');
        const resultBox = document.getElementById('resultBox');
        const cmdText = document.getElementById('cmdText');

        input.addEventListener('input', function() {
            const val = this.value.trim();
            if (!val) { resultBox.classList.remove('show'); return; }
            let cleanUrl = val.replace(/^git clone\\s+/, '').replace(/\\.git$/, '');
            let path = "";
            const match = cleanUrl.match(/github\\.com\\/([^\\/]+\\/[^\\/]+)/);
            if (match) { path = match[1]; } 
            else if (cleanUrl.startsWith("http")) { path = cleanUrl; } 
            else { 
                const parts = cleanUrl.split('/');
                if(parts.length === 2 && !cleanUrl.includes(".")) { path = cleanUrl; } 
                else if (parts.length > 2 && !cleanUrl.startsWith("http")) { path = "https://github.com/" + cleanUrl; } 
                else { path = cleanUrl; }
            }
            let proxyUrl = "";
            if (path.startsWith("http")) {
                 if(path.includes(baseUrl)) { proxyUrl = path; } 
                 else { proxyUrl = baseUrl + "/" + path; }
            } else { proxyUrl = baseUrl + "/" + path + ".git"; }
            cmdText.textContent = "git clone " + proxyUrl;
            resultBox.classList.add('show');
        });

        function copyCmd() {
            const text = cmdText.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = "Success!";
                btn.style.backgroundColor = "#2da44e";
                setTimeout(() => { btn.textContent = originalText; btn.style.backgroundColor = ""; }, 2000);
            });
        }

        // --- 粒子交互动画逻辑 (保持不变) ---
        (function() {
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let width, height;
            let particles = [];
            
            // 配置参数
            const particleCount = 60; // 粒子数量
            const connectionDistance = 150; // 连线距离
            const mouseDistance = 200; // 鼠标吸附距离

            // 鼠标位置
            let mouse = { x: null, y: null };

            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            });
            window.addEventListener('mouseout', () => {
                mouse.x = null;
                mouse.y = null;
            });

            function resize() {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            }

            class Particle {
                constructor() {
                    this.x = Math.random() * width;
                    this.y = Math.random() * height;
                    this.vx = (Math.random() - 0.5) * 1.5; // 速度 X
                    this.vy = (Math.random() - 0.5) * 1.5; // 速度 Y
                    this.size = Math.random() * 2 + 1;
                    this.color = 'rgba(150, 160, 170, 0.5)'; // 粒子颜色
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    // 边界反弹
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;

                    // 鼠标互动（吸引/排斥）- 这里做轻微吸引
                    if (mouse.x != null) {
                        let dx = mouse.x - this.x;
                        let dy = mouse.y - this.y;
                        let distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < mouseDistance) {
                            const forceDirectionX = dx / distance;
                            const forceDirectionY = dy / distance;
                            const force = (mouseDistance - distance) / mouseDistance;
                            const directionX = forceDirectionX * force * 0.05;
                            const directionY = forceDirectionY * force * 0.05;
                            this.vx += directionX;
                            this.vy += directionY;
                        }
                    }
                }

                draw() {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            function init() {
                particles = [];
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            }

            function animate() {
                ctx.clearRect(0, 0, width, height);
                
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();

                    // 绘制连线
                    for (let j = i; j < particles.length; j++) {
                        let dx = particles[i].x - particles[j].x;
                        let dy = particles[i].y - particles[j].y;
                        let distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < connectionDistance) {
                            ctx.beginPath();
                            // 距离越近线越粗/越明显
                            let opacity = 1 - (distance / connectionDistance);
                            ctx.strokeStyle = 'rgba(150, 160, 170, ' + opacity * 0.2 + ')'; 
                            ctx.lineWidth = 1;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(animate);
            }

            resize();
            init();
            animate();
        })();
    </script>
</body>
</html>
    `;
}
