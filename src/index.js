import portal from "./tools/portal.js";
import { ADS_TXT, HEALTH_PATHS, HELP_DEFINITION, PROJECT, TOOL_DEFINITIONS } from "./config.js";
import docker from "./tools/docker.js";
import github from "./tools/github.js";
import help from "./tools/help.js";
import hf from "./tools/hf.js";
import mirrors from "./tools/mirrors.js";
import npm from "./tools/npm.js";
import proxy from "./tools/proxy.js";
import pypi from "./tools/pypi.js";
import go from "./tools/go.js";
import maven from "./tools/maven.js";
import crates from "./tools/crates.js";
import downloads from "./tools/downloads.js";

const HANDLERS = new Map([
  ["portal", portal],
  ["pypi", pypi],
  ["hf", hf],
  ["github", github],
  ["help", help],
  ["docker", docker],
  ["mirrors", mirrors],
  ["proxy", proxy],
  ["npm", npm],
  ["go", go],
  ["maven", maven],
  ["crates", crates],
  ["downloads", downloads],
]);

const TOOLS = TOOL_DEFINITIONS.map((tool) => ({
  ...tool,
  handler: HANDLERS.get(tool.key),
}));

const HOST_ROUTES = new Map(TOOLS.map((tool) => [tool.host, tool]));
const PATH_ROUTES = new Map(TOOLS.map((tool) => [tool.key, tool]));
PATH_ROUTES.set("help", { key: "help", handler: help });
PATH_ROUTES.set("edgemirror", { key: "portal", handler: portal });
PATH_ROUTES.set("box", { key: "portal", handler: portal });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/ads.txt") {
      return textResponse(`${ADS_TXT}\n`, {
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (HEALTH_PATHS.has(url.pathname)) {
      return jsonResponse({
        status: "ok",
        service: PROJECT.name,
        version: PROJECT.version,
        primaryHost: PROJECT.primaryHost,
        hostname: url.hostname,
        tools: TOOL_DEFINITIONS.map(({ key, title, path, status, description }) => ({
          key,
          title,
          path,
          status,
          description,
        })),
        pages: [HELP_DEFINITION],
      });
    }

    const firstSegment = url.pathname.split("/").filter(Boolean)[0];

    if (["v2", "token", "_worker_blob_proxy"].includes(firstSegment)) {
      return docker.fetch(withToolContext(request, "docker"), env, ctx);
    }

    const pathTool = PATH_ROUTES.get(firstSegment);
    if (pathTool) {
      const routedRequest = pathTool.keepPathPrefix
        ? withToolContext(request, pathTool.key)
        : stripToolPrefix(request, firstSegment, pathTool.key);
      return pathTool.handler.fetch(routedRequest, env, ctx);
    }

    const hostTool = HOST_ROUTES.get(url.hostname.toLowerCase());
    if (hostTool) {
      return hostTool.handler.fetch(request, env, ctx);
    }

    return portal.fetch(withToolContext(request, "portal"), env, ctx);
  },
};

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

function textResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(body, {
    ...init,
    headers,
  });
}

function stripToolPrefix(request, segment, contextSegment = segment) {
  const url = new URL(request.url);
  const prefix = `/${segment}`;
  if (url.pathname === prefix) {
    url.pathname = "/";
  } else if (url.pathname.startsWith(`${prefix}/`)) {
    url.pathname = url.pathname.slice(prefix.length);
  }
  return withToolContext(new Request(url.toString(), request), contextSegment);
}

function withToolContext(request, segment) {
  const headers = new Headers(request.headers);
  headers.set("X-EdgeMirror-Tool-Key", segment);
  headers.set("X-EdgeMirror-Base-Path", segment === "portal" ? "" : `/${segment}`);
  return new Request(request, { headers });
}
