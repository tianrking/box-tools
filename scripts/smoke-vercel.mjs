const api = await import("../api/index.js");

const BASE_URL = "https://box-tools.vercel.app";
const TOOLS = [
  { key: "box", path: "", host: "box.w0x7ce.eu" },
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
  { key: "help", path: "/help", host: "box.w0x7ce.eu" },
];

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
    name: "portal path route",
    request: new Request(`${BASE_URL}/box`),
    assert: async (response) =>
      response.status === 200 && response.headers.get("content-type")?.includes("text/html"),
  },
  {
    name: "github path route",
    request: new Request(`${BASE_URL}/github`),
    assert: async (response) =>
      response.status === 200 && response.headers.get("content-type")?.includes("text/html"),
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
  assertNavLinks(html, TOOLS.map((item) => `${BASE_URL}${item.path}`), `${tool.key} path nav`);
  console.log(`ok ${tool.key} path page nav`);
}

for (const tool of TOOLS) {
  const response = await api.default.fetch(new Request(`https://${tool.host}/`));
  const html = await response.text();
  assertHtmlResponse(response, html, `${tool.key} host page`);
  assertNavLinks(html, TOOLS.map((item) => `https://box.w0x7ce.eu${item.path}`), `${tool.key} host nav`);
  console.log(`ok ${tool.key} host page nav`);
}

function assertHtmlResponse(response, html, name) {
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("text/html")) {
    throw new Error(`${name} did not return HTML 200`);
  }
  if (!html.includes('aria-label="Tool navigation"')) {
    throw new Error(`${name} is missing shared tool navigation`);
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
