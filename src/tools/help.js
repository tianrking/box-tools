import { PROJECT, TOOL_DEFINITIONS } from "../config.js";
import { getLanguage, LANGUAGES } from "../i18n.js";
import { getDockerRegistryHost, getToolBaseUrl, renderToolNav } from "../navigation.js";
import { escapeHtml } from "../proxy-utils.js";

const COPY = {
  en: {
    metaDescription:
      "DevBox Workers help page: one-domain routes, web UI, CLI usage, package proxy configuration, Docker registry usage, and deployment notes.",
    eyebrow: "DevBox Workers Help",
    title: "One domain. Every accelerator.",
    lead:
      "Use DevBox Workers as a single-domain edge toolbox. Open a web page for guided commands, or copy the routes into package managers, CLIs, Docker, and download tools.",
    quickTitle: "Quick start",
    servicesLabel: "Services",
    stableRoutes: "Stable routes",
    testRoutes: "Test routes",
    openPortal: "Open dashboard",
    routeSearch: "Search services, routes, or usage",
    allRoutes: "All",
    stableOnly: "Stable",
    testOnly: "Test",
    allCommands: "All commands",
    stableCommands: "Stable",
    testCommands: "Test",
    deployCommands: "Deploy",
    copy: "Copy",
    copied: "Copied",
    open: "Open",
    noRouteResults: "No matching routes.",
    primaryDomain: "Primary domain",
    runtime: "Runtime",
    health: "Health",
    stable: "Stable",
    test: "Test",
    testNote: "Test routes are implemented and verified by smoke tests, but should be validated in your own workflow before being treated as stable.",
    webTitle: "How the Web UI Works",
    webHint: "Tool names stay in English. Explanations and usage notes follow the selected language.",
    portalTitle: "Portal",
    portalText: "Start from the main dashboard, scan all accelerators, and open the specific tool page you need.",
    pathTitle: "Single-domain paths",
    pathText: "Every accelerator runs under the same domain with a dedicated path, which fits Cloudflare Workers and Vercel deployments.",
    cliTitle: "CLI ready",
    cliText: "pip, huggingface-cli, git, docker, npm, go, cargo, wget, and curl can use generated URLs directly.",
    routeTitle: "Route Matrix",
    routeHint: "These are the current service entry points for this deployment.",
    thStatus: "Status",
    thService: "Service",
    thEntry: "Entry",
    thUsage: "What it accelerates",
    commandTitle: "Command Recipes",
    commandHint: "Commands are generated from the active domain. Replace package names, model names, or file URLs as needed.",
    copyHint: "copy and edit",
    deployTitle: "Configuration and Deployment",
    deployHint: "Use the web UI directly, or persist routes inside your tools for long-term acceleration.",
    cloudflareTitle: "Deploy first, then bind a domain",
    cloudflareText:
      "The default wrangler.toml is portable for one-click Cloudflare deployment. Use wrangler.custom-domain.example.toml only after the domain is available in the target account.",
    vercelTitle: "One-click Vercel",
    vercelText:
      "vercel.json forwards every path to api/index.js, so the same path model works on Vercel domains.",
    verifyTitle: "Verify before production",
    verifyText:
      "Run npm run verify before deployment. It checks JavaScript syntax, page navigation, Vercel routing, Docker API routing, and high-severity npm audit results.",
  },
  es: {
    metaDescription:
      "Pagina de ayuda de DevBox Workers: rutas en un solo dominio, interfaz web, uso de CLI, proxies de paquetes, Docker y notas de despliegue.",
    eyebrow: "Ayuda de DevBox Workers",
    title: "Un dominio. Todos los aceleradores.",
    lead:
      "Usa DevBox Workers como una caja de herramientas edge con un solo dominio. Abre una pagina web para obtener comandos guiados, o copia las rutas en gestores de paquetes, CLI, Docker y herramientas de descarga.",
    quickTitle: "Inicio rapido",
    servicesLabel: "Servicios",
    stableRoutes: "Rutas Stable",
    testRoutes: "Rutas Test",
    openPortal: "Abrir panel",
    routeSearch: "Buscar servicios, rutas o uso",
    allRoutes: "Todos",
    stableOnly: "Stable",
    testOnly: "Test",
    allCommands: "Todos",
    stableCommands: "Stable",
    testCommands: "Test",
    deployCommands: "Deploy",
    copy: "Copiar",
    copied: "Copiado",
    open: "Abrir",
    noRouteResults: "Sin rutas coincidentes.",
    primaryDomain: "Dominio principal",
    runtime: "Runtime",
    health: "Salud",
    stable: "Stable",
    test: "Test",
    testNote: "Las rutas Test estan implementadas y cubiertas por smoke tests, pero conviene validarlas en tu propio flujo antes de tratarlas como estables.",
    webTitle: "Como funciona la interfaz web",
    webHint: "Los nombres de herramientas se mantienen en ingles. Las explicaciones y el uso siguen el idioma seleccionado.",
    portalTitle: "Portal",
    portalText: "Empieza en el panel principal, revisa todos los aceleradores y abre la pagina especifica que necesites.",
    pathTitle: "Rutas en un solo dominio",
    pathText: "Cada acelerador vive bajo el mismo dominio con una ruta dedicada, ideal para Cloudflare Workers y Vercel.",
    cliTitle: "Listo para CLI",
    cliText: "pip, huggingface-cli, git, docker, npm, go, cargo, wget y curl pueden usar directamente las URLs generadas.",
    routeTitle: "Matriz de rutas",
    routeHint: "Estos son los puntos de entrada actuales para este despliegue.",
    thStatus: "Estado",
    thService: "Servicio",
    thEntry: "Entrada",
    thUsage: "Que acelera",
    commandTitle: "Recetas de comandos",
    commandHint: "Los comandos se generan desde el dominio activo. Cambia nombres de paquetes, modelos o URLs segun necesites.",
    copyHint: "copiar y editar",
    deployTitle: "Configuracion y despliegue",
    deployHint: "Usa la interfaz web directamente o guarda las rutas en tus herramientas para acelerar de forma permanente.",
    cloudflareTitle: "Despliega primero, luego vincula dominio",
    cloudflareText:
      "El wrangler.toml por defecto es portable para despliegue de Cloudflare con un clic. Usa wrangler.custom-domain.example.toml solo despues de confirmar que el dominio existe en la cuenta destino.",
    vercelTitle: "Vercel con un clic",
    vercelText:
      "vercel.json envia todas las rutas a api/index.js, asi que el mismo modelo de rutas funciona en dominios de Vercel.",
    verifyTitle: "Verifica antes de produccion",
    verifyText:
      "Ejecuta npm run verify antes de desplegar. Revisa sintaxis JavaScript, navegacion, rutas de Vercel, API de Docker y auditoria npm de alta severidad.",
  },
  zh: {
    metaDescription:
      "DevBox Workers 帮助页面：单域名路径、网页入口、命令行用法、包代理配置、Docker registry 用法和部署说明。",
    eyebrow: "DevBox Workers 帮助",
    title: "一个域名，所有加速入口。",
    lead:
      "把 DevBox Workers 当作单域名边缘工具箱使用。你可以打开网页生成命令，也可以把路径写入包管理器、命令行工具、Docker 和下载工具。",
    quickTitle: "快速开始",
    servicesLabel: "服务数量",
    stableRoutes: "Stable 路由",
    testRoutes: "Test 路由",
    openPortal: "打开总入口",
    routeSearch: "搜索服务、路径或用途",
    allRoutes: "全部",
    stableOnly: "Stable",
    testOnly: "Test",
    allCommands: "全部命令",
    stableCommands: "Stable",
    testCommands: "Test",
    deployCommands: "部署",
    copy: "复制",
    copied: "已复制",
    open: "打开",
    noRouteResults: "没有匹配的路由。",
    primaryDomain: "主域名",
    runtime: "运行时",
    health: "健康检查",
    stable: "Stable",
    test: "Test",
    testNote: "Test 路由已经实现并接入 smoke test，但建议在自己的工作流里验证后再提升为稳定用法。",
    webTitle: "网页怎么用",
    webHint: "工具名字保持英文，说明和使用方式会跟随当前选择的语言。",
    portalTitle: "入口面板",
    portalText: "从主面板进入，快速浏览所有加速器，并打开你需要的专属工具页面。",
    pathTitle: "单域名路径",
    pathText: "所有加速器都在同一个域名下，通过不同路径区分服务，适合 Cloudflare Workers 和 Vercel 部署。",
    cliTitle: "命令行友好",
    cliText: "pip、huggingface-cli、git、docker、npm、go、cargo、wget、curl 都可以直接使用生成的 URL。",
    routeTitle: "路由矩阵",
    routeHint: "这是当前部署环境下的实际入口。",
    thStatus: "状态",
    thService: "服务",
    thEntry: "入口",
    thUsage: "可加速资源",
    commandTitle: "命令行示例",
    commandHint: "命令会根据当前域名生成，复制后替换包名、模型名或文件 URL 即可。",
    copyHint: "复制后修改",
    deployTitle: "配置和部署",
    deployHint: "你可以直接使用网页，也可以把路径写进工具配置里长期使用。",
    cloudflareTitle: "先部署，再绑定域名",
    cloudflareText:
      "默认 wrangler.toml 适合一键部署到任意 Cloudflare 账户。只有确认域名属于目标账户后，再参考 wrangler.custom-domain.example.toml 绑定自定义域名。",
    vercelTitle: "Vercel 一键部署",
    vercelText:
      "vercel.json 会把所有路径转给 api/index.js，同一套路由模型可以直接用于 Vercel 域名。",
    verifyTitle: "上线前验证",
    verifyText:
      "部署前运行 npm run verify。它会检查 JavaScript 语法、页面导航、Vercel 路由、Docker API 路由和高危 npm audit。",
  },
};

const SERVICES = [
  ["stable", "PyPI / PyTorch", "pypi", {
    en: "PyPI simple index, Python packages, and PyTorch wheels.",
    es: "Indice simple de PyPI, paquetes Python y wheels de PyTorch.",
    zh: "PyPI simple index、Python 包和 PyTorch wheel。",
  }],
  ["stable", "Hugging Face", "hf", {
    en: "Models, datasets, API requests, and LFS downloads.",
    es: "Modelos, datasets, peticiones API y descargas LFS.",
    zh: "模型、数据集、API 请求和 LFS 大文件下载。",
  }],
  ["stable", "GitHub", "github", {
    en: "Git clone, raw files, releases, and GitHub pages.",
    es: "Git clone, archivos raw, releases y paginas de GitHub.",
    zh: "Git clone、Raw 文件、Release 资源和 GitHub 页面。",
  }],
  ["stable", "Docker", "docker", {
    en: "Docker Hub and multi-registry image pulls through the current /v2 host.",
    es: "Docker Hub y pulls de imagenes multi-registry usando el host /v2 actual.",
    zh: "Docker Hub 和多镜像仓库拉取，通过当前域名的 /v2 使用。",
  }],
  ["stable", "Linux Mirrors", "mirrors", {
    en: "APT, YUM, DNF, Pacman, wget, and curl mirror paths.",
    es: "Rutas espejo para APT, YUM, DNF, Pacman, wget y curl.",
    zh: "APT、YUM、DNF、Pacman、wget、curl 的软件源路径。",
  }],
  ["stable", "Universal Proxy", "proxy", {
    en: "Any HTTP or HTTPS file URL with redirect and filename handling.",
    es: "Cualquier URL HTTP o HTTPS con manejo de redirecciones y nombres de archivo.",
    zh: "任意 HTTP/HTTPS 文件 URL，带重定向和文件名处理。",
  }],
  ["test", "npm Registry", "npm", {
    en: "npm, pnpm, and yarn metadata plus tarball downloads.",
    es: "Metadata y tarballs para npm, pnpm y yarn.",
    zh: "npm、pnpm、yarn metadata 和 tarball 下载。",
  }],
  ["test", "Go Modules", "go", {
    en: "GOPROXY module metadata, .mod files, and .zip files.",
    es: "Metadata GOPROXY, archivos .mod y archivos .zip.",
    zh: "GOPROXY module metadata、.mod 和 .zip 文件。",
  }],
  ["test", "Maven / Gradle", "maven", {
    en: "Maven Central, Google Maven, Gradle Plugin Portal, and JitPack.",
    es: "Maven Central, Google Maven, Gradle Plugin Portal y JitPack.",
    zh: "Maven Central、Google Maven、Gradle Plugin Portal、JitPack。",
  }],
  ["test", "crates.io Sparse", "crates", {
    en: "Cargo sparse index and crate package downloads.",
    es: "Indice sparse de Cargo y descargas de paquetes crate.",
    zh: "Cargo sparse index 和 crate 包下载。",
  }],
  ["test", "Downloads", "downloads", {
    en: "Runtimes, Open VSX, SourceForge, GitLab, Gitea, and direct file URLs.",
    es: "Runtimes, Open VSX, SourceForge, GitLab, Gitea y URLs directas.",
    zh: "运行时、Open VSX、SourceForge、GitLab、Gitea 和直接 URL 文件。",
  }],
];

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
  const lang = getLanguage(request);
  const copy = COPY[lang] ?? COPY.en;
  const htmlLang = LANGUAGES[lang]?.htmlLang ?? "en";
  const urls = Object.fromEntries(TOOL_DEFINITIONS.map((tool) => [tool.key, getToolBaseUrl(request, tool.key)]));
  const dockerHost = getDockerRegistryHost(request);
  const proxyDownloadBase = urls.proxy.endsWith("/proxy") ? urls.proxy : `${urls.proxy}/proxy`;
  const nav = renderToolNav(request, "help");
  const serviceCount = SERVICES.length;
  const stableCount = SERVICES.filter(([status]) => status === "stable").length;
  const testCount = SERVICES.filter(([status]) => status === "test").length;
  const commands = buildCommands(urls, dockerHost, proxyDownloadBase);

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Help | ${PROJECT.name}</title>
  <meta name="description" content="${escapeHtml(copy.metaDescription)}">
  <style>
    :root {
      --bg: #f6f8fb;
      --panel: #ffffff;
      --text: #101827;
      --muted: #647084;
      --border: #dbe3ee;
      --blue: #2563eb;
      --green: #166534;
      --orange: #c2410c;
      --violet: #7c3aed;
      --pink: #d946ef;
      --slate: #0f172a;
      --shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 12% 8%, rgba(37, 99, 235, 0.10), transparent 28%),
        radial-gradient(circle at 88% 12%, rgba(22, 163, 74, 0.10), transparent 26%),
        linear-gradient(180deg, #ffffff 0%, var(--bg) 44%, #eef3f9 100%);
      color: var(--text);
    }
    .nav {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
      padding: 14px 24px;
      background: rgba(255, 255, 255, 0.86);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(16px);
    }
    .nav a {
      text-decoration: none;
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid transparent;
      transition: all 0.18s ease;
    }
    .nav a:hover { color: var(--slate); background: #eef2ff; }
    .nav a.active { color: #fff; background: var(--slate); border-color: var(--slate); }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 42px 0 84px; }
    .language-switch {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin-top: 22px;
    }
    .language-switch a {
      color: var(--muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 900;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255,255,255,0.78);
    }
    .language-switch a.active { color: #fff; background: var(--blue); border-color: var(--blue); }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.18fr) minmax(300px, 0.82fr);
      gap: 28px;
      align-items: stretch;
      margin-bottom: 30px;
    }
    .hero-copy, .hero-panel, .band, .command, .route-table {
      background: rgba(255,255,255,0.88);
      border: 1px solid rgba(219, 227, 238, 0.92);
      border-radius: 14px;
      box-shadow: var(--shadow);
    }
    .hero-copy { padding: clamp(28px, 5vw, 48px); }
    .eyebrow {
      display: inline-flex;
      color: var(--blue);
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    h1 { margin: 0 0 16px; font-size: clamp(38px, 7vw, 72px); line-height: 0.98; letter-spacing: 0; }
    .lead { margin: 0; max-width: 760px; color: var(--muted); font-size: 18px; line-height: 1.72; }
    .hero-panel { padding: 24px; display: grid; align-content: center; }
    .metric { display: grid; gap: 6px; padding: 14px 0; border-bottom: 1px solid #edf2f7; }
    .metric:last-child { border-bottom: 0; }
    .metric span { color: var(--muted); font-size: 13px; font-weight: 800; text-transform: uppercase; }
    .metric strong { overflow-wrap: anywhere; }
    .band { margin-top: 18px; padding: 22px; }
    .section-head { display: flex; justify-content: space-between; gap: 18px; align-items: end; margin-bottom: 16px; }
    h2 { margin: 0; font-size: 25px; letter-spacing: 0; }
    .hint { margin: 0; color: var(--muted); line-height: 1.62; max-width: 620px; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
    .card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
      min-height: 156px;
    }
    .card h3 { margin: 0 0 10px; font-size: 17px; }
    .card p { margin: 0; color: var(--muted); line-height: 1.58; }
    .pill {
      display: inline-flex;
      align-items: center;
      padding: 5px 10px;
      border-radius: 999px;
      color: #fff;
      background: var(--blue);
      font-size: 12px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .pill.green { background: var(--green); }
    .pill.orange { background: var(--orange); }
    .pill.violet { background: var(--violet); }
    .pill.pink { background: var(--pink); }
    .pill.dark { background: var(--slate); }
    .route-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
    }
    .route-scroll {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .route-scroll .route-table {
      box-shadow: none;
      margin: 0;
    }
    .route-table th, .route-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
    .route-table th { background: #f8fafc; font-size: 13px; color: var(--muted); }
    .route-table tr:last-child td { border-bottom: 0; }
    .route-table a { color: var(--blue); font-weight: 900; text-decoration: none; overflow-wrap: anywhere; }
    .route-table a:hover { text-decoration: underline; }
    .route-cards { display: none; gap: 12px; }
    .route-card {
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #fff;
      padding: 16px;
    }
    .route-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
    }
    .route-card h3 { margin: 0; font-size: 17px; }
    .route-card a {
      display: block;
      color: var(--blue);
      font-weight: 900;
      text-decoration: none;
      overflow-wrap: anywhere;
      margin-bottom: 10px;
    }
    .route-card p { margin: 0; color: var(--muted); line-height: 1.56; }
    .commands { display: grid; gap: 14px; }
    .command { overflow: hidden; }
    .command-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 900;
    }
    .command-header span { color: var(--muted); font-size: 13px; font-weight: 800; }
    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      background: #101827;
      color: #d1fae5;
      font-size: 13px;
      line-height: 1.62;
    }
    code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; }
    .note { margin-top: 14px; color: var(--muted); line-height: 1.6; }
    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr; }
      .section-head { display: block; }
      .nav, .language-switch { justify-content: flex-start; }
      .route-table { min-width: 820px; }
    }
    body {
      background: #f5f7fb;
    }
    .hero-copy, .hero-panel, .band, .command, .route-table {
      border-radius: 8px;
      box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    }
    .hero-copy {
      background:
        linear-gradient(135deg, rgba(255,255,255,0.94), rgba(246,248,251,0.94)),
        linear-gradient(90deg, rgba(37,99,235,0.08), rgba(22,163,74,0.08));
      position: relative;
      overflow: hidden;
    }
    .hero-copy::after {
      content: "";
      position: absolute;
      inset: auto 0 0 0;
      height: 5px;
      background: linear-gradient(90deg, var(--blue), var(--green), var(--orange), var(--violet));
    }
    .hero-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 24px;
    }
    .action-link, .copy-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      border-radius: 8px;
      border: 1px solid var(--border);
      padding: 0 14px;
      background: #fff;
      color: var(--slate);
      text-decoration: none;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
    }
    .action-link.primary {
      background: var(--slate);
      border-color: var(--slate);
      color: #fff;
    }
    .copy-button:hover, .action-link:hover {
      border-color: #94a3b8;
      transform: translateY(-1px);
    }
    .metric strong.big {
      font-size: 28px;
      line-height: 1;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .search {
      flex: 1 1 280px;
      min-height: 42px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #fff;
      padding: 0 13px;
      color: var(--text);
      font: inherit;
      outline: none;
    }
    .search:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
    }
    .segmented {
      display: inline-flex;
      gap: 4px;
      padding: 4px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: #f8fafc;
    }
    .segmented button {
      min-height: 32px;
      border: 0;
      border-radius: 6px;
      padding: 0 12px;
      background: transparent;
      color: var(--muted);
      font-size: 12px;
      font-weight: 900;
      cursor: pointer;
    }
    .segmented button.active {
      background: var(--slate);
      color: #fff;
    }
    .route-table tbody tr[hidden], .command[hidden] {
      display: none;
    }
    .route-card[hidden] {
      display: none !important;
    }
    .empty-state {
      display: none;
      padding: 18px;
      border: 1px dashed var(--border);
      border-radius: 8px;
      color: var(--muted);
      background: #fff;
      text-align: center;
      font-weight: 800;
    }
    .empty-state.show { display: block; }
    .command-header {
      align-items: center;
    }
    .command-title {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .command-title strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .command .pill {
      margin-bottom: 0;
      padding: 4px 8px;
    }
    .copy-button {
      min-height: 32px;
      padding: 0 11px;
      font-size: 12px;
    }
    .deploy-steps {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .deploy-step {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 18px;
      background: #fff;
    }
    .deploy-step h3 {
      margin: 0 0 10px;
      font-size: 17px;
    }
    .deploy-step p {
      margin: 0;
      color: var(--muted);
      line-height: 1.58;
    }
    @media (max-width: 900px) {
      .deploy-steps { grid-template-columns: 1fr; }
      .toolbar { align-items: stretch; }
      .segmented { width: 100%; overflow-x: auto; }
      .segmented button { flex: 1 0 auto; }
      .command-header { align-items: flex-start; }
      .route-scroll { display: none; }
      .route-cards { display: grid; }
    }
  </style>
</head>
<body>
  ${nav}
  <main>
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">${escapeHtml(copy.eyebrow)}</span>
        <h1>${escapeHtml(copy.title)}</h1>
        <p class="lead">${escapeHtml(copy.lead)}</p>
        <div class="hero-actions">
          <a class="action-link primary" href="${escapeHtml(urls.box)}">${escapeHtml(copy.openPortal)}</a>
          <a class="action-link" href="#routes">${escapeHtml(copy.routeTitle)}</a>
          <a class="action-link" href="#commands">${escapeHtml(copy.commandTitle)}</a>
          <a class="action-link" href="#deploy">${escapeHtml(copy.deployTitle)}</a>
        </div>
      </div>
      <div class="hero-panel">
        <div class="metric"><span>${escapeHtml(copy.servicesLabel)}</span><strong class="big">${serviceCount}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.stableRoutes)}</span><strong>${stableCount}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.testRoutes)}</span><strong>${testCount}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.primaryDomain)}</span><strong>${escapeHtml(urls.box)}</strong></div>
        <div class="metric"><span>${escapeHtml(copy.health)}</span><strong>${escapeHtml(urls.box)}/healthz</strong></div>
      </div>
    </section>

    <section class="band">
      <div class="section-head">
        <h2>${escapeHtml(copy.webTitle)}</h2>
        <p class="hint">${escapeHtml(copy.webHint)}</p>
      </div>
      <div class="grid">
        ${infoCard("Portal", copy.portalTitle, copy.portalText)}
        ${infoCard("Path mode", copy.pathTitle, copy.pathText, "green")}
        ${infoCard("CLI ready", copy.cliTitle, copy.cliText, "violet")}
      </div>
    </section>

    <section class="band" id="routes">
      <div class="section-head">
        <h2>${escapeHtml(copy.routeTitle)}</h2>
        <p class="hint">${escapeHtml(copy.routeHint)}</p>
      </div>
      <div class="toolbar">
        <input class="search" id="routeSearch" type="search" placeholder="${escapeHtml(copy.routeSearch)}" autocomplete="off">
        <div class="segmented" role="tablist" aria-label="Route status">
          <button class="active" type="button" data-route-filter="all">${escapeHtml(copy.allRoutes)}</button>
          <button type="button" data-route-filter="stable">${escapeHtml(copy.stableOnly)}</button>
          <button type="button" data-route-filter="test">${escapeHtml(copy.testOnly)}</button>
        </div>
      </div>
      <div class="route-scroll">
        <table class="route-table">
          <thead><tr><th>${escapeHtml(copy.thStatus)}</th><th>${escapeHtml(copy.thService)}</th><th>${escapeHtml(copy.thEntry)}</th><th>${escapeHtml(copy.thUsage)}</th></tr></thead>
          <tbody>
            ${SERVICES.map(([status, name, key, descriptions]) => routeRow(status, copy, name, urls[key], descriptions[lang] ?? descriptions.en)).join("")}
          </tbody>
        </table>
      </div>
      <div class="route-cards">
        ${SERVICES.map(([status, name, key, descriptions]) => routeCard(status, copy, name, urls[key], descriptions[lang] ?? descriptions.en)).join("")}
      </div>
      <div class="empty-state" id="routeEmpty">${escapeHtml(copy.noRouteResults)}</div>
      <p class="note">${escapeHtml(copy.testNote)}</p>
    </section>

    <section class="band" id="commands">
      <div class="section-head">
        <h2>${escapeHtml(copy.commandTitle)}</h2>
        <p class="hint">${escapeHtml(copy.commandHint)}</p>
      </div>
      <div class="toolbar">
        <div class="segmented" role="tablist" aria-label="Command category">
          <button class="active" type="button" data-command-filter="all">${escapeHtml(copy.allCommands)}</button>
          <button type="button" data-command-filter="stable">${escapeHtml(copy.stableCommands)}</button>
          <button type="button" data-command-filter="test">${escapeHtml(copy.testCommands)}</button>
          <button type="button" data-command-filter="deploy">${escapeHtml(copy.deployCommands)}</button>
        </div>
      </div>
      <div class="commands">
        ${commands.map((command) => commandBlock(command, copy)).join("")}
      </div>
    </section>

    <section class="band" id="deploy">
      <div class="section-head">
        <h2>${escapeHtml(copy.deployTitle)}</h2>
        <p class="hint">${escapeHtml(copy.deployHint)}</p>
      </div>
      <div class="deploy-steps">
        ${deployStep("01", copy.cloudflareTitle, copy.cloudflareText, "orange")}
        ${deployStep("02", copy.vercelTitle, copy.vercelText, "dark")}
        ${deployStep("03", copy.verifyTitle, copy.verifyText, "pink")}
      </div>
    </section>
  </main>
  <script>
    (function () {
      var copiedText = ${JSON.stringify(copy.copied)};
      var copyText = ${JSON.stringify(copy.copy)};
      function setActive(buttons, active) {
        buttons.forEach(function (button) {
          button.classList.toggle("active", button === active);
        });
      }
      var routeButtons = Array.from(document.querySelectorAll("[data-route-filter]"));
      var routeRows = Array.from(document.querySelectorAll(".route-table tbody tr"));
      var routeCards = Array.from(document.querySelectorAll(".route-card"));
      var routeSearch = document.getElementById("routeSearch");
      var routeEmpty = document.getElementById("routeEmpty");
      var routeFilter = "all";
      function applyRouteFilter() {
        var query = (routeSearch && routeSearch.value || "").trim().toLowerCase();
        var visibleCount = 0;
        routeRows.forEach(function (row) {
          var statusMatch = routeFilter === "all" || row.dataset.status === routeFilter;
          var queryMatch = !query || row.innerText.toLowerCase().indexOf(query) !== -1;
          var visible = statusMatch && queryMatch;
          row.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        routeCards.forEach(function (card) {
          var statusMatch = routeFilter === "all" || card.dataset.status === routeFilter;
          var queryMatch = !query || card.innerText.toLowerCase().indexOf(query) !== -1;
          card.hidden = !(statusMatch && queryMatch);
        });
        if (routeEmpty) routeEmpty.classList.toggle("show", visibleCount === 0);
      }
      routeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          routeFilter = button.dataset.routeFilter;
          setActive(routeButtons, button);
          applyRouteFilter();
        });
      });
      if (routeSearch) routeSearch.addEventListener("input", applyRouteFilter);
      var commandButtons = Array.from(document.querySelectorAll("[data-command-filter]"));
      var commandCards = Array.from(document.querySelectorAll(".command"));
      commandButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var filter = button.dataset.commandFilter;
          setActive(commandButtons, button);
          commandCards.forEach(function (card) {
            card.hidden = filter !== "all" && card.dataset.group !== filter;
          });
        });
      });
      document.querySelectorAll("[data-copy-command]").forEach(function (button) {
        button.addEventListener("click", function () {
          var card = button.closest(".command");
          var code = card && card.querySelector("code");
          if (!code) return;
          navigator.clipboard.writeText(code.innerText).then(function () {
            button.textContent = copiedText;
            setTimeout(function () { button.textContent = copyText; }, 1300);
          });
        });
      });
      applyRouteFilter();
    })();
  </script>
</body>
</html>`;
}

function infoCard(label, title, text, color = "") {
  const colorClass = color ? ` ${color}` : "";
  return `<div class="card"><span class="pill${colorClass}">${escapeHtml(label)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`;
}

function routeRow(status, copy, name, url, description) {
  const label = status === "stable" ? copy.stable : copy.test;
  const color = status === "stable" ? "green" : "orange";
  return `<tr data-status="${escapeHtml(status)}"><td><span class="pill ${color}">${escapeHtml(label)}</span></td><td>${escapeHtml(name)}</td><td><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></td><td>${escapeHtml(description)}</td></tr>`;
}

function routeCard(status, copy, name, url, description) {
  const label = status === "stable" ? copy.stable : copy.test;
  const color = status === "stable" ? "green" : "orange";
  return `<article class="route-card" data-status="${escapeHtml(status)}"><div class="route-card-head"><h3>${escapeHtml(name)}</h3><span class="pill ${color}">${escapeHtml(label)}</span></div><a href="${escapeHtml(url)}">${escapeHtml(url)}</a><p>${escapeHtml(description)}</p></article>`;
}

function commandBlock(command, copy) {
  const color = command.group === "stable" ? "green" : command.group === "test" ? "orange" : "dark";
  return `<div class="command" data-group="${escapeHtml(command.group)}"><div class="command-header"><div class="command-title"><span class="pill ${color}">${escapeHtml(command.groupLabel)}</span><strong>${escapeHtml(command.title)}</strong></div><button class="copy-button" type="button" data-copy-command>${escapeHtml(copy.copy)}</button></div><pre><code>${escapeHtml(command.value)}</code></pre></div>`;
}

function deployStep(number, title, text, color = "") {
  const colorClass = color ? ` ${color}` : "";
  return `<article class="deploy-step"><span class="pill${colorClass}">${escapeHtml(number)}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`;
}

function buildCommands(urls, dockerHost, proxyDownloadBase) {
  return [
    {
      group: "stable",
      groupLabel: "Stable",
      title: "PyPI",
      value: `pip install numpy -i ${urls.pypi}/simple/`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "PyTorch",
      value: `pip install torch torchvision --index-url ${urls.pypi}/pytorch/cu118`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "Hugging Face",
      value: `export HF_ENDPOINT=${urls.hf}\nhuggingface-cli download sentence-transformers/all-MiniLM-L6-v2`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "GitHub",
      value: `git clone ${urls.github}/vercel/next.js.git`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "Docker",
      value: `docker pull ${dockerHost}/library/nginx:latest`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "Docker daemon.json",
      value: `{\n  "registry-mirrors": [\n    "https://${dockerHost}"\n  ]\n}`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "APT source",
      value: `deb ${urls.mirrors}/http://archive.ubuntu.com/ubuntu/ jammy main restricted universe multiverse`,
    },
    {
      group: "stable",
      groupLabel: "Stable",
      title: "Universal Proxy",
      value: `curl -L -O "${proxyDownloadBase}/https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi"`,
    },
    {
      group: "test",
      groupLabel: "Test",
      title: "npm",
      value: `npm install lodash --registry=${urls.npm}/`,
    },
    {
      group: "test",
      groupLabel: "Test",
      title: "Go Modules",
      value: `go env -w GOPROXY=${urls.go},direct`,
    },
    {
      group: "test",
      groupLabel: "Test",
      title: "Maven / Gradle",
      value: `maven { url = uri("${urls.maven}/maven-central") }`,
    },
    {
      group: "test",
      groupLabel: "Test",
      title: "crates.io",
      value: `[source.crates-io]\nreplace-with = "devbox"\n\n[source.devbox]\nregistry = "sparse+${urls.crates}/"`,
    },
    {
      group: "test",
      groupLabel: "Test",
      title: "Downloads",
      value: `curl -L -O "${urls.downloads}/node/v22.11.0/node-v22.11.0-x64.msi"`,
    },
    {
      group: "deploy",
      groupLabel: "Deploy",
      title: "Cloudflare",
      value: "npm ci\nnpx wrangler deploy",
    },
    {
      group: "deploy",
      groupLabel: "Deploy",
      title: "Vercel",
      value: "npm ci\nnpx vercel@latest --prod",
    },
    {
      group: "deploy",
      groupLabel: "Deploy",
      title: "Verify",
      value: "npm run verify",
    },
  ];
}
