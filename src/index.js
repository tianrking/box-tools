import box from "./tools/box.js";
import docker from "./tools/docker.js";
import github from "./tools/github.js";
import hf from "./tools/hf.js";
import mirrors from "./tools/mirrors.js";
import proxy from "./tools/proxy.js";
import pypi from "./tools/pypi.js";

const TOOLS = [
  { key: "box", host: "box.w0x7ce.eu", handler: box },
  { key: "pypi", host: "pypi.w0x7ce.eu", handler: pypi },
  { key: "hf", host: "hf.w0x7ce.eu", handler: hf },
  { key: "github", host: "github.w0x7ce.eu", handler: github },
  { key: "docker", host: "docker.w0x7ce.eu", handler: docker },
  { key: "mirrors", host: "mirrors.w0x7ce.eu", handler: mirrors },
  { key: "proxy", host: "proxy.w0x7ce.eu", handler: proxy, keepPathPrefix: true },
];

const HOST_ROUTES = new Map(TOOLS.map((tool) => [tool.host, tool]));
const PATH_ROUTES = new Map(TOOLS.map((tool) => [tool.key, tool]));

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostTool = HOST_ROUTES.get(url.hostname.toLowerCase());
    if (hostTool) {
      return hostTool.handler.fetch(request, env, ctx);
    }

    const firstSegment = url.pathname.split("/").filter(Boolean)[0];
    const pathTool = PATH_ROUTES.get(firstSegment);
    if (pathTool) {
      const routedRequest = pathTool.keepPathPrefix ? request : stripToolPrefix(request, firstSegment);
      return pathTool.handler.fetch(routedRequest, env, ctx);
    }

    return box.fetch(request, env, ctx);
  },
};

function stripToolPrefix(request, segment) {
  const url = new URL(request.url);
  const prefix = `/${segment}`;
  if (url.pathname === prefix) {
    url.pathname = "/";
  } else if (url.pathname.startsWith(`${prefix}/`)) {
    url.pathname = url.pathname.slice(prefix.length);
  }
  return new Request(url.toString(), request);
}
