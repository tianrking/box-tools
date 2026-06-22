export const LANGUAGES = {
  en: { label: "English", htmlLang: "en" },
  es: { label: "Español", htmlLang: "es" },
  zh: { label: "中文", htmlLang: "zh-CN" },
};

export function getLanguage(request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get("lang");
  return Object.hasOwn(LANGUAGES, lang) ? lang : "en";
}

export function localizeUrl(url, lang) {
  const next = new URL(url);
  if (lang === "en") {
    next.searchParams.delete("lang");
  } else {
    next.searchParams.set("lang", lang);
  }
  return next.toString();
}

export function preserveLanguageUrl(url, lang) {
  return localizeUrl(url, lang);
}

export function renderLanguageSwitch(request, currentLang) {
  const url = new URL(request.url);
  const links = Object.entries(LANGUAGES)
    .map(([lang, meta]) => {
      const href = localizeUrl(url, lang);
      const active = lang === currentLang ? ' class="active"' : "";
      return `<a href="${href}"${active}>${meta.label}</a>`;
    })
    .join("");

  return `<div class="language-switch" aria-label="Language switcher">${links}</div>`;
}

export function renderHeaderLanguageSwitch(request, currentLang) {
  const url = new URL(request.url);
  const labels = { en: "EN", es: "ES", zh: "中文" };
  const links = Object.keys(LANGUAGES)
    .map((lang) => {
      const href = localizeUrl(url, lang);
      const active = lang === currentLang ? ' class="active" aria-current="true"' : "";
      return `<a href="${href}"${active}>${labels[lang]}</a>`;
    })
    .join("");

  return `<div class="devbox-lang-switch" aria-label="Language switcher">${links}</div>`;
}

export function renderClientI18nScript(currentLang) {
  const payload = JSON.stringify({
    lang: currentLang,
    htmlLang: LANGUAGES[currentLang]?.htmlLang ?? LANGUAGES.en.htmlLang,
    dictionary: UI_TRANSLATIONS[currentLang] ?? UI_TRANSLATIONS.en,
  }).replaceAll("</", "<\\/");

  return `<script>window.__DEVBOX_I18N__=${payload};(function(){
  var config = window.__DEVBOX_I18N__;
  if (!config || !config.dictionary) return;
  document.documentElement.lang = config.htmlLang || "en";
  var dictionary = config.dictionary;
  var skipTags = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "SVG", "PATH"]);
  function translate(value) {
    if (!value) return value;
    var trimmed = value.trim().replace(/\\s+/g, " ");
    if (dictionary[trimmed]) return dictionary[trimmed];
    var translated = value;
    Object.keys(dictionary)
      .sort(function(a, b) { return b.length - a.length; })
      .forEach(function(key) {
        if (key && translated.indexOf(key) !== -1) {
          translated = translated.split(key).join(dictionary[key]);
        }
      });
    return translated;
  }
  function applyTranslations() {
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(function(element) {
      var next = translate(element.getAttribute("placeholder"));
      if (next) element.setAttribute("placeholder", next);
    });
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node) {
      var parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName) || parent.closest("script,style,code,pre,svg")) return;
      var text = node.nodeValue;
      var trimmed = text.trim().replace(/\\s+/g, " ");
      var replacement = dictionary[trimmed] || translate(text);
      if (!replacement) return;
      var leading = (text.match(/^\\s*/) || [""])[0];
      var trailing = (text.match(/\\s*$/) || [""])[0];
      node.nodeValue = replacement === text ? text : leading + replacement.trim() + trailing;
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyTranslations, { once: true });
  } else {
    applyTranslations();
  }
})();</script>`;
}

const UI_TRANSLATIONS = {
  en: {
    "复制": "Copy",
    "已复制": "Copied",
    "状态": "Status",
    "原始地址": "Original",
    "加速地址": "Accelerated",
    "Original": "Original",
    "Accelerated": "Accelerated",
    "Example mapping": "Example mapping",
    "映射示例": "Example mapping",
    "输入": "Enter",
    "自动生成命令": "to generate the command",
    "加速标准 PyPI 包": "accelerates standard PyPI packages",
    "加速 PyTorch/CUDA 大文件": "accelerates PyTorch and CUDA wheels",
    "💡 推荐使用官方高速下载器 (多线程/断点续传):": "Recommended official fast downloader (multi-threaded and resumable):",
    "默认为 Docker Hub，支持": "Defaults to Docker Hub and supports",
    "自动补全": "auto-complete",
    "支持": "Supports",
    "等前缀路由": "and other registry prefixes",
    "WGET 标准下载 CURL -O 保存文件": "WGET standard download; CURL -O saves the file",
    "临时使用": "Temporary use",
    "长期配置": "Persistent config",
    "恢复默认": "Restore default",
    "单次环境变量": "One-shot environment variable",
    "测试 index": "Test index",
    "Python 依赖包与 PyTorch 大模型极速下载，支持自动匹配 CUDA 版本。": "Fast Python package and PyTorch wheel downloads with automatic CUDA channel guidance.",
    "AI 模型权重与数据集下载加速，支持 Token 鉴权与 LFS 大文件多线程传输。": "Accelerate AI model weights and datasets, including token-authenticated LFS files.",
    "Git Clone 仓库克隆、Releases 发布文件及 Raw 文件加速。": "Accelerate git clone, release assets, and raw GitHub files.",
    "Docker Hub, Quay, GCR, K8s 等容器镜像仓库加速，解决拉取超时。": "Accelerate Docker Hub, Quay, GCR, Kubernetes, and other image registries.",
    "APT (Ubuntu/Debian), YUM (CentOS), DNF 等系统源透传加速。": "Pass-through acceleration for APT, YUM, DNF, and other Linux repository sources.",
    "万能文件下载器，自动修正文件名，解决跨域与防盗链限制。": "Universal file downloader with filename handling and edge forwarding.",
    "单域名路径玩法、网页入口、命令行用法、工具配置和部署说明都在这里。": "Single-domain routing, web entry points, CLI usage, tool configuration, and deployment notes.",
    "Repo 地址 (支持简写)": "Repository address (short form supported)",
    "输入 vercel/next.js 自动生成命令": "Enter vercel/next.js to generate the command.",
    "链接可直接访问，支持 Releases / Raw": "Links can be opened directly, including Releases and Raw files.",
    "边缘节点流式传输，无大小限制": "Edge streaming transfer with no app-level size limit.",
    "Install Package (自动识别 PyTorch)": "Install package (PyTorch detected automatically)",
    "/simple/ 加速标准 PyPI 包": "/simple/ accelerates standard PyPI packages",
    "/pytorch/ 加速 PyTorch/CUDA 大文件": "/pytorch/ accelerates PyTorch and CUDA wheels",
    "自动匹配 CUDA 版本 (默认 cu118)": "Automatically selects the CUDA channel (default cu118)",
    "Pull Image (自动识别多源)": "Pull image (multi-registry detection)",
    "默认为 Docker Hub，支持 library/ 自动补全": "Defaults to Docker Hub and auto-completes library/ images.",
    "支持 gcr.io, quay.io, k8s.gcr.io 等前缀路由": "Supports gcr.io, quay.io, k8s.gcr.io and other registry prefixes.",
    "自动修复 AWS S3 签名与 401 认证错误": "Fixes AWS S3 redirect signatures and 401 auth issues automatically.",
    "粘贴源地址 (如 http://archive.ubuntu.com/ubuntu)": "Paste a source URL (for example http://archive.ubuntu.com/ubuntu)",
    "APT / YUM / DNF / Wget 透传加速": "Pass-through acceleration for APT / YUM / DNF / Wget",
    "统一代理常见运行时、开发工具、Open VSX、SourceForge、GitLab/Gitea release 文件，也支持直接粘贴完整 HTTP URL。": "Proxy common runtimes, developer tools, Open VSX, SourceForge, GitLab/Gitea release files, and direct HTTP URLs.",
    "适合二进制安装包和 release asset 下载；带登录态或反盗链的上游仍需要按原站规则处理。": "Good for binary installers and release assets; authenticated or hotlink-protected upstreams still follow the original site's rules.",
    "代理 npm registry metadata 与 tarball 下载，适合 Node.js 项目安装依赖时临时或长期配置。": "Proxy npm registry metadata and tarball downloads for temporary or persistent Node.js dependency installs.",
    "已支持 registry metadata rewrite 和 tarball 下载；企业私有 npm token、publish 流程建议先在测试环境验证。": "Registry metadata rewrite and tarball downloads are supported; private npm tokens and publish flows should be validated in a test environment.",
    "兼容 Go module proxy 协议，代理 module list、version metadata、mod 文件和 zip 包下载。": "GOPROXY-compatible module list, version metadata, .mod files, and .zip downloads.",
    "模块代理路径已可用；sumdb 仍建议使用 Go 默认设置或你自己的可信配置。": "Module proxy paths are available; keep Go's default sumdb settings or your own trusted configuration.",
    "为 Maven Central、Google Maven、Gradle Plugin Portal 和 JitPack 提供统一路径代理。": "Unified path proxy for Maven Central, Google Maven, Gradle Plugin Portal, and JitPack.",
    "下载和 metadata 代理已可用；Gradle plugin marker 与私有仓库认证建议先做项目级验证。": "Downloads and metadata proxying are available; validate Gradle plugin markers and private repository auth per project.",
    "代理 crates.io sparse index 和 crate 包下载，适合 Rust / Cargo 项目依赖拉取。": "Proxy the crates.io sparse index and crate downloads for Rust / Cargo dependency fetching.",
    "Sparse index 与 crate download 已代理；publish、yank、token API 不在当前稳定范围。": "Sparse index and crate downloads are proxied; publish, yank, and token APIs are outside the current stable scope.",
    "Paste file URL (e.g. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)": "Paste file URL (e.g. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)",
    "例如: torch 或 numpy": "e.g. torch or numpy",
    "例如: nginx:latest 或 quay.io/coreos/etcd": "e.g. nginx:latest or quay.io/coreos/etcd",
  },
  es: {
    "Copy": "Copiar",
    "复制": "Copiar",
    "Copied": "Copiado",
    "已复制": "Copiado",
    "Status": "Estado",
    "状态": "Estado",
    "Original": "Original",
    "原始地址": "Original",
    "Accelerated": "Acelerado",
    "加速地址": "Acelerado",
    "Example mapping": "Ejemplo de mapeo",
    "映射示例": "Ejemplo de mapeo",
    "输入": "Escribe",
    "自动生成命令": "para generar el comando",
    "加速标准 PyPI 包": "acelera paquetes PyPI estandar",
    "加速 PyTorch/CUDA 大文件": "acelera wheels grandes de PyTorch/CUDA",
    "💡 推荐使用官方高速下载器 (多线程/断点续传):": "Recomendado: descargador oficial rapido (multi-hilo y reanudable):",
    "默认为 Docker Hub，支持": "Usa Docker Hub por defecto y admite",
    "自动补全": "autocompletado",
    "支持": "Admite",
    "等前缀路由": "y otros prefijos de registro",
    "WGET 标准下载 CURL -O 保存文件": "WGET descarga estandar; CURL -O guarda el archivo",
    "临时使用": "Uso temporal",
    "长期配置": "Configuracion persistente",
    "恢复默认": "Restaurar valor predeterminado",
    "单次环境变量": "Variable de entorno puntual",
    "测试 index": "Probar index",
    "Python 依赖包与 PyTorch 大模型极速下载，支持自动匹配 CUDA 版本。": "Descargas rapidas de paquetes Python y wheels PyTorch con guia automatica de CUDA.",
    "AI 模型权重与数据集下载加速，支持 Token 鉴权与 LFS 大文件多线程传输。": "Acelera pesos de modelos y datasets, incluidos archivos LFS con token.",
    "Git Clone 仓库克隆、Releases 发布文件及 Raw 文件加速。": "Acelera git clone, release assets y archivos raw de GitHub.",
    "Docker Hub, Quay, GCR, K8s 等容器镜像仓库加速，解决拉取超时。": "Acelera Docker Hub, Quay, GCR, Kubernetes y otros registros de imagenes.",
    "APT (Ubuntu/Debian), YUM (CentOS), DNF 等系统源透传加速。": "Aceleracion passthrough para APT, YUM, DNF y otros repositorios Linux.",
    "万能文件下载器，自动修正文件名，解决跨域与防盗链限制。": "Descargador universal con manejo de nombres y reenvio edge.",
    "单域名路径玩法、网页入口、命令行用法、工具配置和部署说明都在这里。": "Rutas de dominio unico, entrada web, CLI, configuracion y despliegue.",
    "Repo 地址 (支持简写)": "Repositorio (admite forma corta)",
    "输入 vercel/next.js 自动生成命令": "Escribe vercel/next.js para generar el comando.",
    "链接可直接访问，支持 Releases / Raw": "Los enlaces se pueden abrir directamente, incluidos Releases y Raw.",
    "边缘节点流式传输，无大小限制": "Transferencia streaming en el edge sin limite de tamaño de la app.",
    "Install Package (自动识别 PyTorch)": "Instalar paquete (detecta PyTorch automaticamente)",
    "/simple/ 加速标准 PyPI 包": "/simple/ acelera paquetes PyPI estandar",
    "/pytorch/ 加速 PyTorch/CUDA 大文件": "/pytorch/ acelera wheels grandes de PyTorch/CUDA",
    "自动匹配 CUDA 版本 (默认 cu118)": "Selecciona automaticamente el canal CUDA (cu118 por defecto)",
    "Pull Image (自动识别多源)": "Descargar imagen (detecta multiples registros)",
    "默认为 Docker Hub，支持 library/ 自动补全": "Usa Docker Hub por defecto y completa library/ automaticamente.",
    "支持 gcr.io, quay.io, k8s.gcr.io 等前缀路由": "Admite prefijos como gcr.io, quay.io y k8s.gcr.io.",
    "自动修复 AWS S3 签名与 401 认证错误": "Corrige redirecciones firmadas de AWS S3 y errores 401 automaticamente.",
    "粘贴源地址 (如 http://archive.ubuntu.com/ubuntu)": "Pega una URL origen (por ejemplo http://archive.ubuntu.com/ubuntu)",
    "APT / YUM / DNF / Wget 透传加速": "Aceleracion passthrough para APT / YUM / DNF / Wget",
    "统一代理常见运行时、开发工具、Open VSX、SourceForge、GitLab/Gitea release 文件，也支持直接粘贴完整 HTTP URL。": "Proxy para runtimes, herramientas, Open VSX, SourceForge, releases de GitLab/Gitea y URLs HTTP directas.",
    "适合二进制安装包和 release asset 下载；带登录态或反盗链的上游仍需要按原站规则处理。": "Adecuado para instaladores binarios y release assets; los origenes con login o proteccion anti-hotlink siguen sus reglas.",
    "代理 npm registry metadata 与 tarball 下载，适合 Node.js 项目安装依赖时临时或长期配置。": "Proxy de metadata y tarballs de npm para instalaciones temporales o persistentes en proyectos Node.js.",
    "已支持 registry metadata rewrite 和 tarball 下载；企业私有 npm token、publish 流程建议先在测试环境验证。": "Soporta metadata rewrite y tarballs; valida tokens privados y publish en un entorno de prueba.",
    "兼容 Go module proxy 协议，代理 module list、version metadata、mod 文件和 zip 包下载。": "Compatible con GOPROXY: module list, metadata de version, archivos .mod y .zip.",
    "模块代理路径已可用；sumdb 仍建议使用 Go 默认设置或你自己的可信配置。": "Las rutas de modulo estan disponibles; conserva sumdb por defecto o tu configuracion confiable.",
    "为 Maven Central、Google Maven、Gradle Plugin Portal 和 JitPack 提供统一路径代理。": "Proxy unificado para Maven Central, Google Maven, Gradle Plugin Portal y JitPack.",
    "下载和 metadata 代理已可用；Gradle plugin marker 与私有仓库认证建议先做项目级验证。": "Descargas y metadata estan disponibles; valida plugin markers y repos privados por proyecto.",
    "代理 crates.io sparse index 和 crate 包下载，适合 Rust / Cargo 项目依赖拉取。": "Proxy del sparse index de crates.io y descargas .crate para Rust / Cargo.",
    "Sparse index 与 crate download 已代理；publish、yank、token API 不在当前稳定范围。": "Sparse index y descargas .crate estan proxied; publish, yank y token API quedan fuera del alcance estable.",
    "Paste file URL (e.g. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)": "Pega una URL de archivo (ej. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)",
    "例如: torch 或 numpy": "ej. torch o numpy",
    "例如: nginx:latest 或 quay.io/coreos/etcd": "ej. nginx:latest o quay.io/coreos/etcd",
  },
  zh: {
    "Copy": "复制",
    "Copied": "已复制",
    "Status": "状态",
    "Original": "原始地址",
    "Accelerated": "加速地址",
    "Example mapping": "映射示例",
    "Repo 地址 (支持简写)": "仓库地址（支持简写）",
    "Repository address (short form supported)": "仓库地址（支持简写）",
    "Enter vercel/next.js to generate the command.": "输入 vercel/next.js 自动生成命令。",
    "Links can be opened directly, including Releases and Raw files.": "链接可直接访问，支持 Releases / Raw。",
    "Edge streaming transfer with no app-level size limit.": "边缘节点流式传输，无应用层大小限制。",
    "Install Package (自动识别 PyTorch)": "安装包（自动识别 PyTorch）",
    "Install package (PyTorch detected automatically)": "安装包（自动识别 PyTorch）",
    "/simple/ accelerates standard PyPI packages": "/simple/ 加速标准 PyPI 包",
    "/pytorch/ accelerates PyTorch and CUDA wheels": "/pytorch/ 加速 PyTorch / CUDA wheel",
    "Automatically selects the CUDA channel (default cu118)": "自动匹配 CUDA 通道（默认 cu118）",
    "Pull image (multi-registry detection)": "拉取镜像（自动识别多源）",
    "Defaults to Docker Hub and auto-completes library/ images.": "默认为 Docker Hub，支持 library/ 自动补全。",
    "Supports gcr.io, quay.io, k8s.gcr.io and other registry prefixes.": "支持 gcr.io、quay.io、k8s.gcr.io 等前缀路由。",
    "Fixes AWS S3 redirect signatures and 401 auth issues automatically.": "自动修复 AWS S3 签名与 401 认证问题。",
    "Paste a source URL (for example http://archive.ubuntu.com/ubuntu)": "粘贴源地址（如 http://archive.ubuntu.com/ubuntu）",
    "Pass-through acceleration for APT / YUM / DNF / Wget": "APT / YUM / DNF / Wget 透传加速",
    "Paste file URL (e.g. https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi)": "粘贴文件 URL（如 https://nodejs.org/dist/v22.11.0/node-v22.11.0-x64.msi）",
    "e.g. torch or numpy": "例如：torch 或 numpy",
    "e.g. nginx:latest or quay.io/coreos/etcd": "例如：nginx:latest 或 quay.io/coreos/etcd",
  },
};
