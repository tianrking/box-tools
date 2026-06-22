import { HELP_DEFINITION, PROJECT, TOOL_DEFINITIONS } from "./config.js";
import { getLanguage, preserveLanguageUrl } from "./i18n.js";

const TOOL_BY_KEY = new Map(TOOL_DEFINITIONS.map((tool) => [tool.key, tool]));
const KNOWN_HOSTS = new Set(TOOL_DEFINITIONS.map((tool) => tool.host));
const NAV_ITEMS = [...TOOL_DEFINITIONS, HELP_DEFINITION];

const NAV_LABELS = {
  box: "Box",
  pypi: "PyPI",
  hf: "Hugging Face",
  github: "GitHub",
  docker: "Docker",
  mirrors: "Linux",
  proxy: "Proxy",
  npm: "npm",
  go: "Go",
  maven: "Maven",
  crates: "Crates",
  downloads: "Downloads",
  help: "Help",
};

export function getToolBaseUrl(request, key) {
  const url = new URL(request.url);
  const origin = getAppOrigin(url);
  const item = key === HELP_DEFINITION.key ? HELP_DEFINITION : TOOL_BY_KEY.get(key);

  if (!item) {
    return origin;
  }

  return `${origin}${item.path ?? `/${key}`}`;
}

export function getDockerRegistryHost(request) {
  const url = new URL(request.url);
  return new URL(getAppOrigin(url)).host;
}

export function renderToolNav(request, activeKey) {
  const lang = getLanguage(request);
  const links = NAV_ITEMS.map((item) => {
    const active = item.key === activeKey ? ' class="active"' : "";
    const href = preserveLanguageUrl(getToolBaseUrl(request, item.key), lang);
    return `<a href="${href}"${active}>${NAV_LABELS[item.key] ?? item.title}</a>`;
  });

  return `<nav class="nav" aria-label="Tool navigation">${links.join("")}</nav>`;
}

export function getAppOrigin(url) {
  if (KNOWN_HOSTS.has(url.hostname.toLowerCase())) {
    return `https://${PROJECT.primaryHost}`;
  }

  return url.origin;
}
