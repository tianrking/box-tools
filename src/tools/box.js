import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";

/**
 * Developer Toolbox Portal (Elegant & Spacious Edition)
 * 路径: / and /box
 * 特性: 大尺寸卡片 + 呼吸感交互 + 详情模态框
 */

export default {
    async fetch(request) {
        return new Response(htmlPage(request), {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
};

function htmlPage(request) {
    const urls = {
        box: getToolBaseUrl(request, "box"),
        pypi: getToolBaseUrl(request, "pypi"),
        hf: getToolBaseUrl(request, "hf"),
        github: getToolBaseUrl(request, "github"),
        docker: getToolBaseUrl(request, "docker"),
        mirrors: getToolBaseUrl(request, "mirrors"),
        proxy: getToolBaseUrl(request, "proxy"),
        npm: getToolBaseUrl(request, "npm"),
        go: getToolBaseUrl(request, "go"),
        maven: getToolBaseUrl(request, "maven"),
        crates: getToolBaseUrl(request, "crates"),
        downloads: getToolBaseUrl(request, "downloads"),
        help: getToolBaseUrl(request, "help"),
    };
    const dockerRegistryHost = getDockerRegistryHost(request);
    const proxyDownloadBaseUrl = urls.proxy.endsWith("/proxy") ? urls.proxy : `${urls.proxy}/proxy`;
    const nav = renderToolNav(request, "box");

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevBox | w0x7ce</title>
    <style>
        :root {
            --bg: #f8fafc;
            --text-main: #1e293b;
            --text-desc: #475569;
            --card-bg: rgba(255, 255, 255, 0.85);
            --modal-overlay: rgba(15, 23, 42, 0.4);
            
            /* 品牌色 */
            --c-pypi: #ee4c2c;
            --c-hf: #ffd21e;
            --c-linux: #8b5cf6;
            --c-github: #2da44e;
            --c-docker: #0db7ed;
            --c-proxy: #d946ef;
            --c-npm: #cb3837;
            --c-go: #00add8;
            --c-maven: #c71a36;
            --c-crates: #dea584;
            --c-downloads: #0f766e;
            --c-help: #0f172a;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; outline: none; }
        
        body { 
            background: var(--bg); color: var(--text-main); 
            min-height: 100vh; display: flex; flex-direction: column; align-items: center; 
            overflow-x: hidden; position: relative;
        }

        #canvas-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }

        .nav { position: absolute; top: 20px; right: 30px; display: flex; gap: 10px; z-index: 10; flex-wrap: wrap; justify-content: flex-end; }
        .nav a { text-decoration: none; color: var(--text-desc); font-size: 13px; font-weight: 700; padding: 7px 14px; border-radius: 20px; transition: all 0.2s; background: rgba(255,255,255,0.72); border: 1px solid rgba(15,23,42,0.08); backdrop-filter: blur(8px); }
        .nav a:hover { color: #0f172a; background: #fff; transform: translateY(-1px); }
        .nav a.active { background: #0f172a; color: #fff; border-color: #0f172a; }

        /* --- Header --- */
        header { text-align: center; padding: 100px 20px 60px; z-index: 1; animation: fadeIn 1s ease; }
        
        .logo-box { 
            width: 72px; height: 72px; background: #0f172a; color: #fff; 
            border-radius: 18px; display: flex; align-items: center; justify-content: center; 
            margin: 0 auto 25px; font-weight: 800; font-size: 32px; 
            box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);
            transform: rotate(-3deg); transition: transform 0.3s;
        }
        header:hover .logo-box { transform: rotate(0deg) scale(1.05); }

        h1 { font-size: 3rem; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 15px; color: #0f172a; }
        .subtitle { 
            font-size: 1.2rem; color: var(--text-desc); font-weight: 400; max-width: 600px; margin: 0 auto; line-height: 1.6;
        }

        /* --- Grid (加大尺寸) --- */
        .grid {
            display: grid; 
            /* 卡片最小宽度设为 340px，保证宽敞 */
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); 
            gap: 30px;
            width: 100%; max-width: 1200px; padding: 0 30px 100px; z-index: 1;
        }

        .section-label {
            grid-column: 1 / -1;
            display: flex; align-items: center; justify-content: space-between; gap: 16px;
            color: #0f172a; font-size: 0.9rem; font-weight: 900; letter-spacing: 0;
            text-transform: uppercase; margin: 8px 0 -8px;
        }
        .section-label span {
            color: #475569; text-transform: none; font-size: 0.92rem; font-weight: 600;
        }

        /* --- Card (核心优化) --- */
        .card {
            background: var(--card-bg); 
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 24px;
            padding: 35px; 
            position: relative; overflow: hidden; cursor: pointer;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
            transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex; flex-direction: column; 
            min-height: 280px; /* 增加高度，防止挤压 */
        }

        /* 悬停交互：上浮 + 投影 + 边框色 */
        .card:hover { 
            transform: translateY(-10px); 
            background: #fff;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px var(--color); /* 光晕边框 */
        }

        /* 顶部装饰条 */
        .card::after { 
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 6px; 
            background: var(--color); opacity: 0; transition: opacity 0.4s; 
        }
        .card:hover::after { opacity: 1; }

        .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 25px; }
        
        .icon { 
            width: 56px; height: 56px; border-radius: 14px; 
            display: flex; align-items: center; justify-content: center; 
            background: rgba(241, 245, 249, 0.8); color: var(--color); 
            transition: all 0.4s ease; 
        }
        .card:hover .icon { background: var(--color); color: #fff; transform: scale(1.1) rotate(-5deg); box-shadow: 0 10px 20px -5px var(--color); }
        .icon svg { width: 30px; height: 30px; fill: currentColor; }

        .arrow-icon { font-size: 24px; color: #64748b; transition: all 0.3s; }
        .card:hover .arrow-icon { color: var(--color); transform: translateX(5px); }

        .title { font-weight: 800; font-size: 1.4rem; margin-bottom: 12px; letter-spacing: -0.5px; color: #1e293b; }
        .desc { font-size: 1rem; color: var(--text-desc); line-height: 1.7; flex-grow: 1; padding-bottom: 10px; }

        /* 底部操作区 (默认隐藏，悬停滑入) */
        .action-area {
            margin-top: auto;
            background: #f1f5f9; border-radius: 12px; padding: 12px 16px;
            display: flex; align-items: center; justify-content: space-between;
            opacity: 0; transform: translateY(20px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .card:hover .action-area { opacity: 1; transform: translateY(0); }

        .cmd-preview { 
            font-family: 'Consolas', monospace; font-size: 0.85rem; color: #475569; 
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%;
        }
        .action-btn {
            font-size: 0.8rem; font-weight: 800; color: #fff; text-transform: uppercase;
            background: #0f172a; padding: 6px 12px; border-radius: 8px; border: 1px solid #0f172a;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05); cursor: pointer; transition: all 0.2s;
        }
        .action-btn:hover { background: #1e293b; color: #fff; }

        /* --- Modal --- */
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: var(--modal-overlay); backdrop-filter: blur(10px);
            z-index: 100; opacity: 0; visibility: hidden; transition: all 0.3s;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .modal-overlay.active { opacity: 1; visibility: visible; }

        .modal {
            background: #fff; width: 100%; max-width: 750px;
            border-radius: 24px; box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.4);
            transform: scale(0.95) translateY(20px); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            overflow: hidden; display: flex; flex-direction: column; max-height: 85vh;
        }
        .modal-overlay.active .modal { transform: scale(1) translateY(0); }

        .modal-header { 
            padding: 30px 35px; border-bottom: 1px solid #f1f5f9; 
            display: flex; align-items: center; justify-content: space-between; 
        }
        .modal-title-box { display: flex; align-items: center; gap: 15px; }
        .modal-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: var(--bg); color: var(--color); }
        .modal-icon svg { width: 24px; height: 24px; fill: currentColor; }
        .modal-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        
        .close-btn { 
            width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0; 
            display: flex; align-items: center; justify-content: center; font-size: 20px; 
            color: #64748b; cursor: pointer; transition: all 0.2s; background: transparent;
        }
        .close-btn:hover { background: #f1f5f9; color: #0f172a; transform: rotate(90deg); }

        .tabs { display: flex; padding: 0 35px; margin-top: 20px; gap: 10px; border-bottom: 1px solid #f1f5f9; }
        .tab-btn { 
            padding: 12px 20px; background: none; border: none; font-size: 0.95rem; font-weight: 600; 
            color: #64748b; cursor: pointer; position: relative; transition: color 0.2s;
        }
        .tab-btn::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--color); transform: scaleX(0); transition: transform 0.3s; }
        .tab-btn.active { color: var(--color); }
        .tab-btn.active::after { transform: scaleX(1); }

        .modal-body { padding: 35px; overflow-y: auto; background: #fafafa; flex-grow: 1; }
        .tab-content { display: none; animation: slideIn 0.3s ease; }
        .tab-content.active { display: block; }

        /* Code Blocks inside Modal */
        .instruction { font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 12px; }
        .code-wrap {
            background: #1e293b; border-radius: 12px; border: 1px solid #334155;
            padding: 20px; margin-bottom: 25px; position: relative;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .code-pre { 
            font-family: 'Consolas', 'Monaco', monospace; font-size: 0.95rem; line-height: 1.6; 
            color: #e2e8f0; white-space: pre-wrap; word-break: break-all; 
        }
        .cmd { color: #38bdf8; font-weight: 700; }
        .arg { color: #fbbf24; }
        .comment { color: #64748b; font-style: italic; margin-bottom: 8px; display: block; font-size: 0.85rem; }

        .modal-copy-btn {
            position: absolute; top: 15px; right: 15px;
            background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.1);
            padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
            transition: all 0.2s;
        }
        .modal-copy-btn:hover { background: var(--color); border-color: var(--color); color: #000; }

        /* Footer */
        footer { margin-top: auto; padding: 40px; font-size: 14px; color: #94a3b8; letter-spacing: 0.5px; }
        .heart { color: #ef4444; display: inline-block; animation: beat 1.5s infinite; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes beat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        
        /* Mobile */
        @media (max-width: 600px) {
            h1 { font-size: 2.2rem; }
            .grid { grid-template-columns: 1fr; padding: 0 20px 60px; }
            .card { min-height: auto; }
            .action-area { opacity: 1; transform: translateY(0); margin-top: 15px; background: #f8fafc; } /* 移动端常显 */
        }
    </style>
</head>
<body>
    <canvas id="canvas-bg"></canvas>
    ${nav}

    <header>
        <div class="logo-box">B</div>
        <h1>Dev<b>Box</b></h1>
        <p class="subtitle">Ultimate Accelerator Collection for Developers</p>
    </header>

    <div class="grid">
        <div class="section-label">Stable accelerators <span>verified and recommended for daily use</span></div>
        
        <div class="card" onclick="openModal('pypi')" style="--color: var(--c-pypi)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">PyPI / Torch</div>
            <div class="desc">Python 依赖包与 PyTorch 大模型极速下载，支持自动匹配 CUDA 版本。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">pip install ... -i ...</div>
                <button class="action-btn" onclick="openModal('pypi')">View Details</button>
            </div>
        </div>

        <div class="card" onclick="openModal('hf')" style="--color: var(--c-hf)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M15 9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Zm-6 0H8a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Zm3 4a3 3 0 0 0-3 3 .5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5 3 3 0 0 0-3-3Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Hugging Face</div>
            <div class="desc">AI 模型权重与数据集下载加速，支持 Token 鉴权与 LFS 大文件多线程传输。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">export HF_ENDPOINT=...</div>
                <button class="action-btn" onclick="openModal('hf')">View Details</button>
            </div>
        </div>

        <div class="card" onclick="openModal('github')" style="--color: var(--c-github)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">GitHub Proxy</div>
            <div class="desc">Git Clone 仓库克隆、Releases 发布文件及 Raw 文件加速。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">git clone https://...</div>
                <button class="action-btn" onclick="openModal('github')">View Details</button>
            </div>
        </div>

        <div class="card" onclick="openModal('docker')" style="--color: var(--c-docker)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M2 13h2v2H2zm4 0h2v2H6zm-2-4h2v2H4zm4 0h2v2H8zm-2-4h2v2H6zm6 8h2v2h-2zm-2-4h2v2h-2zm4 0h2v2h-2zm2 4h2v2h-2zm-2-4h2v2h-2zm4 0h2v2h-2zm-2-4h2v2h-2zm-2-4h2v2h-2zm12 12h-2v4h-2v-4h-2v4h-2v-4h-2v4H2v-2h18v-2h2v4z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Docker Hub</div>
            <div class="desc">Docker Hub, Quay, GCR, K8s 等容器镜像仓库加速，解决拉取超时。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">docker pull ...</div>
                <button class="action-btn" onclick="openModal('docker')">View Details</button>
            </div>
        </div>

        <div class="card" onclick="openModal('mirrors')" style="--color: var(--c-linux)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Linux Mirrors</div>
            <div class="desc">APT (Ubuntu/Debian), YUM (CentOS), DNF 等系统源透传加速。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">/etc/apt/sources.list</div>
                <button class="action-btn" onclick="openModal('mirrors')">View Details</button>
            </div>
        </div>

        <div class="card" onclick="openModal('proxy')" style="--color: var(--c-proxy)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">File Proxy</div>
            <div class="desc">万能文件下载器，自动修正文件名，解决跨域与防盗链限制。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">wget / curl -O ...</div>
                <button class="action-btn" onclick="openModal('proxy')">View Details</button>
            </div>
        </div>

        <div class="section-label">Test accelerators <span>new routes ready for validation and feedback</span></div>

        <div class="card" onclick="window.location.href='${urls.npm}'" style="--color: var(--c-npm)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3m4 5v8h3v-5h2v5h5V8H7Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">npm Registry</div>
            <div class="desc">Test route for npm, pnpm, and yarn registry metadata plus tarball downloads.</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">npm --registry ${urls.npm}</div>
                <button class="action-btn" onclick="window.location.href='${urls.npm}'">Open</button>
            </div>
        </div>

        <div class="card" onclick="window.location.href='${urls.go}'" style="--color: var(--c-go)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M4 9h8v2H4V9m-2 4h8v2H2v-2m4 4h8v2H6v-2m9.5-8A4.5 4.5 0 1 1 11 13.5 4.5 4.5 0 0 1 15.5 9m0 2A2.5 2.5 0 1 0 18 13.5 2.5 2.5 0 0 0 15.5 11Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Go Modules</div>
            <div class="desc">Test GOPROXY-compatible route for module metadata, mod files, and zip archives.</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">go env -w GOPROXY=...</div>
                <button class="action-btn" onclick="window.location.href='${urls.go}'">Open</button>
            </div>
        </div>

        <div class="card" onclick="window.location.href='${urls.maven}'" style="--color: var(--c-maven)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M4 4h16v4H4V4m0 6h16v4H4v-4m0 6h16v4H4v-4Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Maven / Gradle</div>
            <div class="desc">Test route for Maven Central, Google Maven, Gradle Plugin Portal, and JitPack.</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">maven { url = uri(...) }</div>
                <button class="action-btn" onclick="window.location.href='${urls.maven}'">Open</button>
            </div>
        </div>

        <div class="card" onclick="window.location.href='${urls.crates}'" style="--color: var(--c-crates)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M12 2 2 7v10l10 5 10-5V7L12 2m0 2.2L18.7 7 12 9.8 5.3 7 12 4.2M4 8.6l7 2.9v7.7l-7-3.5V8.6m16 0v7.1l-7 3.5v-7.7l7-2.9Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">crates.io Sparse</div>
            <div class="desc">Test route for Cargo sparse index and crate package downloads.</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">sparse+${urls.crates}/</div>
                <button class="action-btn" onclick="window.location.href='${urls.crates}'">Open</button>
            </div>
        </div>

        <div class="card" onclick="window.location.href='${urls.downloads}'" style="--color: var(--c-downloads)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2M19 9h-4V3H9v6H5l7 7 7-7Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Downloads</div>
            <div class="desc">Test route for runtimes, Open VSX, SourceForge, GitLab, Gitea, and direct file URLs.</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">${urls.downloads}/node/...</div>
                <button class="action-btn" onclick="window.location.href='${urls.downloads}'">Open</button>
            </div>
        </div>

        <div class="card" onclick="window.location.href='${urls.help}'" style="--color: var(--c-help)">
            <div class="card-header">
                <div class="icon"><svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2Zm1-16A10 10 0 1 0 22 12 10.01 10.01 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8Zm0-14a3.5 3.5 0 0 0-3.5 3.5h2A1.5 1.5 0 1 1 12 11c-1.13 0-2 .87-2 2v1h2v-1c0-.28.22-.5.5-.5A3.5 3.5 0 0 0 12 6Z"/></svg></div>
                <div class="arrow-icon">→</div>
            </div>
            <div class="title">Help Center</div>
            <div class="desc">单域名路径玩法、网页入口、命令行用法、工具配置和部署说明都在这里。</div>
            <div class="action-area" onclick="event.stopPropagation()">
                <div class="cmd-preview">${urls.help}</div>
                <button class="action-btn" onclick="window.location.href='${urls.help}'">Open Help</button>
            </div>
        </div>

    </div>

    <footer>
        Made with <span class="heart">❤</span> by <a href="https://github.com/tianrking" style="color:inherit;text-decoration:none;font-weight:600;" target="_blank">w0x7ce</a>
    </footer>

    <div class="modal-overlay" id="modalOverlay" onclick="if(event.target === this) closeModal()">
        <div class="modal">
            <div class="modal-header">
                <div class="modal-title-box" id="mTitleBox">
                    <div class="modal-title" id="mTitle">Title</div>
                </div>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="tabs" id="mTabs"></div>
            <div class="modal-body" id="mBody"></div>
        </div>
    </div>

    <script>
        // --- Data: Tools Information ---
        const tools = {
            pypi: {
                title: "PyPI / PyTorch",
                color: "#ee4c2c",
                tabs: ["Quick Run", "Global Config", "PyTorch"],
                icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
                content: [
                    \`<div class="instruction">Temporary Install</div>
                    <div class="code-wrap"><span class="comment"># 单次安装依赖</span><br><div class="code-pre"><span class="cmd">pip</span> install <span class="arg">numpy</span> -i ${urls.pypi}/simple</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.pypi}" target="_blank" style="color:var(--c-pypi)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">Global Configuration (Recommended)</div>
                    <div class="code-wrap"><span class="comment"># 设置为默认源，永久生效</span><br><div class="code-pre"><span class="cmd">pip</span> config set global.index-url ${urls.pypi}/simple</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`,
                    
                    \`<div class="instruction">Install PyTorch (CUDA 11.8)</div>
                    <div class="code-wrap"><span class="comment"># PyTorch 专用加速通道</span><br><div class="code-pre"><span class="cmd">pip</span> install torch torchvision --index-url ${urls.pypi}/pytorch/cu118</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`
                ]
            },
            hf: {
                title: "Hugging Face",
                color: "#ffd21e",
                tabs: ["CLI", "Python", "HF Transfer"],
                icon: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/><path d="M15 9h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Zm-6 0H8a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2Zm3 4a3 3 0 0 0-3 3 .5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5 3 3 0 0 0-3-3Z"/>',
                content: [
                    \`<div class="instruction">Hugging Face CLI</div>
                    <div class="code-wrap"><span class="comment"># 原始: huggingface-cli download sentence-transformers/all-MiniLM-L6-v2</span><br><div class="code-pre">export HF_ENDPOINT=${urls.hf}<br><span class="cmd">huggingface-cli</span> download <span class="arg">sentence-transformers/all-MiniLM-L6-v2</span></div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.hf}" target="_blank" style="color:var(--c-hf)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">Python Code</div>
                    <div class="code-wrap"><div class="code-pre">import os<br>os.environ["HF_ENDPOINT"] = "${urls.hf}"<br><br>from huggingface_hub import snapshot_download<br>snapshot_download(repo_id="<span class="arg">gpt2</span>")</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`,

                    \`<div class="instruction">High Speed (Multi-thread)</div>
                    <div class="code-wrap"><span class="comment"># 启用 hf_transfer 加速下载</span><br><div class="code-pre">pip install hf_transfer<br>export HF_HUB_ENABLE_HF_TRANSFER=1<br>export HF_ENDPOINT=${urls.hf}</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`
                ]
            },
            github: {
                title: "GitHub Proxy",
                color: "#2da44e",
                tabs: ["Git Clone", "Wget"],
                icon: '<path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"/>',
                content: [
                    \`<div class="instruction">Clone Repository</div>
                    <div class="code-wrap"><span class="comment"># 原始: git clone https://github.com/vercel/next.js.git</span><br><div class="code-pre"><span class="cmd">git</span> clone ${urls.github}/<span class="arg">vercel/next.js.git</span></div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.github}" target="_blank" style="color:var(--c-github)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">Download Release / Raw</div>
                    <div class="code-wrap"><span class="comment"># 原始: https://github.com/vercel/next.js/archive/refs/heads/canary.zip</span><br><div class="code-pre"><span class="cmd">wget</span> ${urls.github}/https://github.com/vercel/next.js/archive/refs/heads/canary.zip</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`
                ]
            },
            docker: {
                title: "Docker Hub",
                color: "#0db7ed",
                tabs: ["Pull", "Daemon Config"],
                icon: '<path d="M2 13h2v2H2zm4 0h2v2H6zm-2-4h2v2H4zm4 0h2v2H8zm-2-4h2v2H6zm6 8h2v2h-2zm-2-4h2v2h-2zm4 0h2v2h-2zm2 4h2v2h-2zm-2-4h2v2h-2zm4 0h2v2h-2zm-2-4h2v2h-2zm-2-4h2v2h-2zm12 12h-2v4h-2v-4h-2v4h-2v-4h-2v4H2v-2h18v-2h2v4z"/>',
                content: [
                    \`<div class="instruction">Direct Pull</div>
                    <div class="code-wrap"><div class="code-pre"><span class="cmd">docker</span> pull ${dockerRegistryHost}/library/<span class="arg">nginx:latest</span></div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.docker}" target="_blank" style="color:var(--c-docker)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">/etc/docker/daemon.json</div>
                    <div class="code-wrap"><div class="code-pre">{<br>  "registry-mirrors": [<br>    "https://${dockerRegistryHost}"<br>  ]<br>}</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <div class="code-wrap"><span class="comment"># 重启 Docker 生效</span><br><div class="code-pre">sudo systemctl daemon-reload && sudo systemctl restart docker</div></div>\`
                ]
            },
            mirrors: {
                title: "Linux Mirrors",
                color: "#8b5cf6",
                tabs: ["Ubuntu (APT)", "CentOS (YUM)"],
                icon: '<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>',
                content: [
                    \`<div class="instruction">/etc/apt/sources.list</div>
                    <div class="code-wrap"><div class="code-pre">deb ${urls.mirrors}/http://archive.ubuntu.com/ubuntu/ jammy main restricted</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.mirrors}" target="_blank" style="color:var(--c-linux)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">/etc/yum.repos.d/xxx.repo</div>
                    <div class="code-wrap"><div class="code-pre">baseurl=${urls.mirrors}/http://mirror.centos.org/centos/7/os/x86_64/</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`
                ]
            },
            proxy: {
                title: "Universal Proxy",
                color: "#d946ef",
                tabs: ["Wget", "Curl"],
                icon: '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>',
                content: [
                    \`<div class="instruction">Wget Download</div>
                    <div class="code-wrap"><span class="comment"># 原始: https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi</span><br><div class="code-pre"><span class="cmd">wget</span> "${proxyDownloadBaseUrl}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>
                    <a href="${urls.proxy}" target="_blank" style="color:var(--c-proxy)">Go to Website →</a>\`,
                    
                    \`<div class="instruction">Curl Download</div>
                    <div class="code-wrap"><span class="comment"># 原始: https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi</span><br><div class="code-pre"><span class="cmd">curl</span> -L -O "${proxyDownloadBaseUrl}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"</div><button class="modal-copy-btn" onclick="copyText(this)">Copy</button></div>\`
                ]
            }
        };

        // --- Logic ---
        const modal = document.getElementById('modalOverlay');
        const mTitleBox = document.getElementById('mTitleBox');
        const mTabs = document.getElementById('mTabs');
        const mBody = document.getElementById('mBody');
        let currentTool = null;

        function openModal(key) {
            currentTool = tools[key];
            
            // Set Header
            mTitleBox.innerHTML = \`<div class="modal-icon" style="color:\${currentTool.color}"><svg viewBox="0 0 24 24">\${currentTool.icon}</svg></div><div class="modal-title">\${currentTool.title}</div>\`;
            
            // Generate Tabs
            mTabs.innerHTML = currentTool.tabs.map((t, i) => 
                \`<button class="tab-btn \${i===0?'active':''}" onclick="switchTab(\${i})" style="--color:\${currentTool.color}">\${t}</button>\`
            ).join('');

            // Generate Content
            mBody.innerHTML = currentTool.content.map((c, i) => 
                \`<div class="tab-content \${i===0?'active':''}">\${c}</div>\`
            ).join('');

            // Reset scroll
            mBody.scrollTop = 0;
            
            modal.classList.add('active');
        }

        function closeModal() {
            modal.classList.remove('active');
        }

        function switchTab(index) {
            document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === index));
            document.querySelectorAll('.tab-content').forEach((c, i) => c.classList.toggle('active', i === index));
        }

        function copyText(btn) {
            const codeBlock = btn.previousElementSibling;
            const text = codeBlock.innerText; 
            navigator.clipboard.writeText(text).then(() => {
                const original = btn.innerText;
                btn.innerText = "Copied!";
                btn.style.background = currentTool.color;
                btn.style.borderColor = currentTool.color;
                setTimeout(() => { 
                    btn.innerText = original; 
                    btn.style.background = "";
                    btn.style.borderColor = "rgba(255,255,255,0.1)";
                }, 1500);
            });
        }

        // Particle Effect
        (function(){
            const canvas = document.getElementById('canvas-bg');
            const ctx = canvas.getContext('2d');
            let w,h,ps=[]; const colors=['#ee4c2c','#ffd21e','#2da44e','#0db7ed','#8b5cf6','#d946ef'];
            const resize=()=>{w=canvas.width=window.innerWidth;h=canvas.height=window.innerHeight};
            window.onresize=resize; resize();
            for(let i=0;i<60;i++) ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*0.3,vy:(Math.random()-.5)*0.3,c:colors[i%6]});
            function run(){
                ctx.clearRect(0,0,w,h);
                ps.forEach(p=>{
                    p.x+=p.vx; p.y+=p.vy;
                    if(p.x<0||p.x>w) p.vx*=-1; if(p.y<0||p.y>h) p.vy*=-1;
                    ctx.fillStyle=p.c; ctx.globalAlpha=0.2; ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill();
                });
                requestAnimationFrame(run);
            }
            run();
        })();
    </script>
</body>
</html>
    `;
}
