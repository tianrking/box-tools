const api = await import("../api/index.js");

const BASE_URL = "https://edgemirror.vercel.app";
const TOOLS = [
  { key: "portal", path: "/edgemirror", host: "edgemirror.w0x7ce.eu" },
  { key: "pypi", path: "/pypi", host: "pypi.w0x7ce.eu" },
  { key: "hf", path: "/hf", host: "hf.w0x7ce.eu" },
  { key: "github", path: "/github", host: "github.w0x7ce.eu" },
  { key: "docker", path: "/docker", host: "docker.w0x7ce.eu" },
  { key: "mirrors", path: "/mirrors", host: "mirrors.w0x7ce.eu" },
  { key: "proxy", path: "/proxy", host: "proxy.w0x7ce.eu" },
  { key: "npm", path: "/npm", host: "npm.w0x7ce.eu" },
  { key: "go", path: "/go", host: "go.w0x7ce.eu" },
  { key: "maven", path: "/maven", host: "maven.w0x7ce.eu" },
  { key: "crates", path: "/crates", host: "crates.w0x7ce.eu" },
  { key: "downloads", path: "/downloads", host: "downloads.w0x7ce.eu" },
  { key: "help", path: "/help", host: "edgemirror.w0x7ce.eu" },
];

const PAGE_IDENTITY = new Map([
  ["portal", "Edge mirrors"],
  ["pypi", "PyTorch"],
  ["hf", "Model hub accelerator"],
  ["github", "GitHub"],
  ["docker", "Docker Proxy Accelerator"],
  ["mirrors", "Linux repository accelerator"],
  ["proxy", "Universal File Fetcher"],
  ["npm", "npm / pnpm / yarn Proxy"],
  ["go", "Go Module Proxy"],
  ["maven", "Maven / Gradle Proxy"],
  ["crates", "crates.io Sparse Proxy"],
  ["downloads", "Runtime & Release Downloads"],
  ["help", "One domain. Every accelerator."],
]);

const checks = [
  {
    name: "health",
    request: new Request(`${BASE_URL}/healthz`),
    assert: async (response) => {
      const payload = await response.json();
      return response.status === 200 && payload.status === "ok" && Array.isArray(payload.tools);
    },
  },
  {
    name: "ads.txt",
    request: new Request(`${BASE_URL}/ads.txt`),
    assert: async (response) => {
      const text = await response.text();
      return response.status === 200
        && response.headers.get("content-type")?.includes("text/plain")
        && text.trim() === "google.com, pub-8741919641227561, DIRECT, f08c47fec0942fa0";
    },
  },
  {
    name: "portal path route",
    request: new Request(`${BASE_URL}/edgemirror`),
    assert: async (response) => response.status === 200 && response.headers.get("content-type")?.includes("text/html"),
  },
  {
    name: "github path route",
    request: new Request(`${BASE_URL}/github`),
    assert: async (response) => response.status === 200 && response.headers.get("content-type")?.includes("text/html"),
  },
  {
    name: "docker registry route detection",
    request: new Request(`${BASE_URL}/v2/`, { method: "HEAD" }),
    assert: async (response) => [200, 401].includes(response.status),
  },
  {
    name: "npm metadata rewrite",
    request: new Request(`${BASE_URL}/npm/lodash`),
    assert: async (response) => {
      const text = await response.text();
      return response.status === 200 && text.includes(`${BASE_URL}/npm/lodash/-/`);
    },
  },
  {
    name: "crates sparse config rewrite",
    request: new Request(`${BASE_URL}/crates/config.json`),
    assert: async (response) => {
      const payload = await response.json();
      return response.status === 200 && payload.dl === `${BASE_URL}/crates/api/v1/crates`;
    },
  },
  {
    name: "help default english",
    request: new Request(`${BASE_URL}/help`),
    assert: async (response) => {
      const html = await response.text();
      return response.status === 200 && html.includes("One domain. Every accelerator.") && html.includes('lang="en"');
    },
  },
  {
    name: "help spanish language",
    request: new Request(`${BASE_URL}/help?lang=es`),
    assert: async (response) => {
      const html = await response.text();
      return response.status === 200 && html.includes("Un dominio. Todos los aceleradores.") && html.includes('lang="es"') && html.includes("/pypi?lang=es");
    },
  },
  {
    name: "help chinese language",
    request: new Request(`${BASE_URL}/help?lang=zh`),
    assert: async (response) => {
      const html = await response.text();
      return response.status === 200 && html.includes("一个域名，所有加速入口。") && html.includes('lang="zh-CN"') && html.includes("/pypi?lang=zh");
    },
  },
];

for (const check of checks) {
  const response = await api.default.fetch(check.request);
  if (!(await check.assert(response))) {
    throw new Error(`${check.name} failed with status ${response.status}`);
  }
  console.log(`ok ${check.name}`);
}

for (const tool of TOOLS) {
  const response = await api.default.fetch(new Request(`${BASE_URL}${tool.path}`));
  const html = await response.text();
  assertHtmlResponse(response, html, `${tool.key} page`);
  assertNavLinks(html, TOOLS.map((item) => urlFor(BASE_URL, item.path)), `${tool.key} path nav`);
  assertPageIdentity(html, tool.key, `${tool.key} path page`);
  console.log(`ok ${tool.key} path page nav`);
}

for (const tool of TOOLS) {
  const response = await api.default.fetch(new Request(`https://edgemirror.w0x7ce.eu${tool.path}`));
  const html = await response.text();
  assertHtmlResponse(response, html, `${tool.key} primary-domain path page`);
  assertNavLinks(html, TOOLS.map((item) => urlFor("https://edgemirror.w0x7ce.eu", item.path)), `${tool.key} primary-domain nav`);
  assertPageIdentity(html, tool.key, `${tool.key} primary-domain path page`);
  console.log(`ok ${tool.key} primary-domain path page nav`);
}

for (const tool of TOOLS) {
  const hostUrl = tool.key === "help" ? `https://${tool.host}${tool.path}` : `https://${tool.host}/`;
  const response = await api.default.fetch(new Request(hostUrl));
  const html = await response.text();
  assertHtmlResponse(response, html, `${tool.key} host page`);
  assertNavLinks(html, TOOLS.map((item) => urlFor("https://edgemirror.w0x7ce.eu", item.path)), `${tool.key} host nav`);
  assertPageIdentity(html, tool.key, `${tool.key} host page`);
  console.log(`ok ${tool.key} host page nav`);
}

function assertHtmlResponse(response, html, name) {
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("text/html")) {
    throw new Error(`${name} did not return HTML 200`);
  }
  if (!html.includes('aria-label="Tool navigation"')) {
    throw new Error(`${name} is missing shared tool navigation`);
  }
  if (!html.includes('class="edgemirror-header"')) {
    throw new Error(`${name} is missing unified header wrapper`);
  }
  if (!html.includes('class="edgemirror-lang-switch"') || !html.includes('aria-label="Language switcher"')) {
    throw new Error(`${name} is missing global language switcher`);
  }
  if (!html.includes("window.__EDGEMIRROR_I18N__")) {
    throw new Error(`${name} is missing client i18n payload`);
  }
}

function assertNavLinks(html, expectedLinks, name) {
  const hrefs = [...html.matchAll(/<nav[^>]*aria-label="Tool navigation"[^>]*>([\s\S]*?)<\/nav>/g)]
    .flatMap((match) => [...match[1].matchAll(/href="([^"]+)"/g)].map((hrefMatch) => hrefMatch[1]));

  for (const link of expectedLinks) {
    if (!hrefs.includes(link)) {
      throw new Error(`${name} is missing ${link}. Found: ${hrefs.join(", ")}`);
    }
  }
}

function assertPageIdentity(html, key, name) {
  const marker = PAGE_IDENTITY.get(key);
  if (marker && !html.includes(marker)) {
    throw new Error(`${name} is missing identity marker: ${marker}`);
  }
}

function urlFor(origin, path) {
  return new URL(path || "/", origin).toString();
}
