<p align="center">
  <strong>English</strong> | <a href="README.es.md">Español</a> | <a href="README.zh-CN.md">中文</a>
</p>

<h1 align="center">DevBox Workers</h1>

<p align="center">
  A production-ready developer accelerator toolbox for PyPI, PyTorch, Hugging Face, GitHub, Docker registries, Linux mirrors, npm, Go modules, Maven, crates.io, runtime downloads, and universal file forwarding.
</p>

<p align="center">
  <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools">
    <img alt="Deploy to Cloudflare" src="https://img.shields.io/badge/Deploy%20to-Cloudflare-f38020?style=for-the-badge&logo=cloudflare&logoColor=white&labelColor=111827">
  </a>
  <a href="https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools">
    <img alt="Deploy with Vercel" src="https://img.shields.io/badge/Deploy%20with-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white&labelColor=111827">
  </a>
</p>

<p align="center">
  <img alt="Verify" src="https://img.shields.io/github/actions/workflow/status/tianrking/box-tools/verify.yml?branch=main&style=for-the-badge&label=verify">
  <img alt="Runtime" src="https://img.shields.io/badge/runtime-Cloudflare%20Workers%20%7C%20Vercel%20Functions-0f172a?style=for-the-badge">
  <img alt="Language" src="https://img.shields.io/badge/language-JavaScript%20ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Package manager" src="https://img.shields.io/badge/package-npm-cb3837?style=for-the-badge">
  <img alt="Maintainer" src="https://img.shields.io/badge/maintainer-tianrking-2563eb?style=for-the-badge">
</p>

## Why DevBox Workers

DevBox Workers is a single-domain edge application that turns one repository into a fast, self-hostable developer toolbox. The recommended production model is one public domain, such as `box.w0x7ce.eu`, with each accelerator exposed by path: `/pypi`, `/hf`, `/github`, `/docker`, `/mirrors`, `/proxy`, `/npm`, `/go`, `/maven`, `/crates`, `/downloads`, and `/help`.

Maintainer: [tianrking](https://github.com/tianrking)

Keywords: Cloudflare Workers proxy, Vercel Functions proxy, PyPI mirror accelerator, PyTorch wheel proxy, Hugging Face mirror, Docker registry proxy, GitHub raw proxy, Linux mirror proxy, npm registry proxy, Go module proxy, Maven proxy, Gradle mirror, crates.io sparse registry proxy, runtime download accelerator, developer toolbox.

## Tool Stack

<p align="center">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge">
  <img alt="Vercel Functions" src="https://img.shields.io/badge/Vercel-Functions-000?style=for-the-badge">
  <img alt="JavaScript ESM" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Single domain" src="https://img.shields.io/badge/single--domain-paths-2563eb?style=for-the-badge">
  <img alt="Path routing" src="https://img.shields.io/badge/path-routing-16a34a?style=for-the-badge">
  <img alt="PyPI" src="https://img.shields.io/badge/PyPI-packages-3775a9?style=for-the-badge">
  <img alt="PyTorch" src="https://img.shields.io/badge/PyTorch-wheels-ee4c2c?style=for-the-badge">
  <img alt="Hugging Face" src="https://img.shields.io/badge/Hugging%20Face-models-ffd21e?style=for-the-badge&labelColor=111827">
  <img alt="GitHub" src="https://img.shields.io/badge/GitHub-proxy-2da44e?style=for-the-badge">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-registry-0db7ed?style=for-the-badge">
  <img alt="Linux mirrors" src="https://img.shields.io/badge/Linux-mirrors-8b5cf6?style=for-the-badge">
  <img alt="Universal proxy" src="https://img.shields.io/badge/Universal-file%20proxy-d946ef?style=for-the-badge">
  <img alt="npm" src="https://img.shields.io/badge/npm-registry-cb3837?style=for-the-badge">
  <img alt="Go modules" src="https://img.shields.io/badge/Go-modules-00add8?style=for-the-badge">
  <img alt="Maven" src="https://img.shields.io/badge/Maven-Gradle-c71a36?style=for-the-badge">
  <img alt="crates.io" src="https://img.shields.io/badge/crates.io-sparse-dea584?style=for-the-badge&labelColor=111827">
  <img alt="Downloads" src="https://img.shields.io/badge/runtime-downloads-0f766e?style=for-the-badge">
  <img alt="Syntax check" src="https://img.shields.io/badge/syntax-check-22c55e?style=for-the-badge">
  <img alt="Smoke test" src="https://img.shields.io/badge/smoke-tested-22c55e?style=for-the-badge">
  <img alt="npm audit" src="https://img.shields.io/badge/npm-audit-22c55e?style=for-the-badge">
  <img alt="One click deploy" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=for-the-badge">
  <img alt="Wrangler" src="https://img.shields.io/badge/Wrangler-4.x-f38020?style=for-the-badge">
</p>

## Service Matrix

`Stable` means the route is recommended for daily use. `Test` means the accelerator is implemented, wired into smoke checks, and ready for validation before it is promoted to stable.

| Status | Service | Single-domain route | What it accelerates |
| --- | --- | --- | --- |
| Stable | DevBox Portal | `/` or `/box` | Visual dashboard and usage snippets for every tool |
| Stable | Help | `/help` | Route map, web usage, CLI recipes, and configuration guide in English, Spanish, and Chinese |
| Stable | PyPI / PyTorch | `/pypi` | PyPI simple index, package files, and PyTorch wheel downloads |
| Stable | Hugging Face | `/hf` | Hugging Face API, model files, datasets, and LFS downloads |
| Stable | GitHub | `/github` | Git clone, raw files, release assets, and GitHub pages |
| Stable | Docker Registry | `/docker` UI, `/v2` API | Docker Hub plus `quay`, `gcr`, `k8s`, `ghcr`, `nvcr` prefixes |
| Stable | Linux Mirrors | `/mirrors` | APT, YUM, DNF, Pacman, wget, and curl mirror paths |
| Stable | Universal Proxy | `/proxy` | Any HTTP/HTTPS file URL with filename handling |
| Test | npm Registry | `/npm` | npm, pnpm, yarn metadata and tarball downloads |
| Test | Go Module Proxy | `/go` | GOPROXY module list, version metadata, `.mod`, and `.zip` files |
| Test | Maven / Gradle | `/maven` | Maven Central, Google Maven, Gradle Plugin Portal, and JitPack |
| Test | crates.io Sparse | `/crates` | Cargo sparse index and `.crate` package downloads |
| Test | Runtime Downloads | `/downloads` | Node.js, Python, Go, Rustup, Open VSX, SourceForge, GitLab, Gitea, and direct file URLs |

## One-Click Deployment

### Deploy to Cloudflare Workers

Click the Cloudflare button at the top of this README, or open:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools
```

Cloudflare reads `wrangler.toml`, creates the Worker, and deploys it to the account-provided Worker name. The default configuration is intentionally portable: it enables `workers.dev`, disables preview URLs, and does not bind the maintainer's custom domain.

After the Worker is deployed, add one custom domain in the Cloudflare dashboard, or copy the route block from `wrangler.custom-domain.example.toml` into `wrangler.toml` after confirming that the domain belongs to your Cloudflare account. Every tool will still use the same path model on that domain.

### Deploy to Vercel

Click the Vercel button at the top of this README, or open:

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools
```

Vercel uses `api/index.js` as a Web Handler function and `vercel.json` to route every path to that function. The Vercel deployment uses the same path model: `/pypi`, `/hf`, `/github`, `/docker`, `/mirrors`, `/proxy`, `/npm`, `/go`, `/maven`, `/crates`, `/downloads`, and `/help`. Docker Registry API traffic is also auto-detected at `/v2`, `/token`, and `/_worker_blob_proxy`, so a single Vercel domain can serve Docker pulls without a `/docker` prefix in the image name.

## Local Development

```bash
npm install
npm run verify
npm run dev
```

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Cloudflare Worker dev server |
| `npm run dev:cloudflare` | Same as `npm run dev` |
| `npm run dev:vercel` | Start Vercel local development with `npx vercel@latest dev` |
| `npm run check` | Syntax-check every JavaScript file under `src` and `scripts` |
| `npm run smoke:vercel` | Import the Vercel function entry and verify core routes |
| `npm run verify` | Run syntax check, Vercel smoke test, and high-severity npm audit |
| `npm run deploy:cloudflare` | Deploy with Wrangler |
| `npm run deploy:vercel` | Deploy to Vercel production with `npx vercel@latest --prod` |

## Routing Model

DevBox Workers is designed around single-domain path routing:

| Runtime style | Example | Notes |
| --- | --- | --- |
| Path routing | `https://box.w0x7ce.eu/pypi/simple/` | Recommended production model |
| Vercel path routing | `https://your-app.vercel.app/pypi/simple/` | Same routes after one-click Vercel deploy |

For Docker on a single-domain deployment, use the deployment host directly:

```bash
docker pull your-app.vercel.app/library/nginx:latest
```

The router forwards Docker's `/v2`, `/token`, and blob redirect traffic to the Docker tool automatically.

Health checks are available at:

```text
/health
/healthz
/__health
```

They return JSON with the project version and the registered service list.

## Examples

Install a Python package:

```bash
pip install numpy -i https://box.w0x7ce.eu/pypi/simple/
```

Install PyTorch wheels:

```bash
pip install torch torchvision --index-url https://box.w0x7ce.eu/pypi/pytorch/cu118
```

Download a Hugging Face model:

```bash
export HF_ENDPOINT=https://box.w0x7ce.eu/hf
huggingface-cli download gpt2
```

Clone through the GitHub proxy:

```bash
git clone https://box.w0x7ce.eu/github/tianrking/box-tools.git
```

Pull a Docker image:

```bash
docker pull box.w0x7ce.eu/library/nginx:latest
```

Proxy a generic file:

```bash
curl -L -O "https://box.w0x7ce.eu/proxy/https://example.com/file.zip"
```

Use the new test npm registry route:

```bash
npm install lodash --registry=https://box.w0x7ce.eu/npm/
pnpm install lodash --registry=https://box.w0x7ce.eu/npm/
```

Use the new test Go module route:

```bash
go env -w GOPROXY=https://box.w0x7ce.eu/go,direct
```

Use the new test Maven / Gradle routes:

```kotlin
repositories {
    maven { url = uri("https://box.w0x7ce.eu/maven/maven-central") }
    maven { url = uri("https://box.w0x7ce.eu/maven/google") }
    maven { url = uri("https://box.w0x7ce.eu/maven/gradle-plugin") }
}
```

Use the new test crates.io sparse route:

```toml
[source.crates-io]
replace-with = "devbox"

[source.devbox]
registry = "sparse+https://box.w0x7ce.eu/crates/"
```

Use the new test runtime download route:

```bash
curl -L -O "https://box.w0x7ce.eu/downloads/node/v22.11.0/node-v22.11.0-x64.msi"
curl -L -O "https://box.w0x7ce.eu/downloads/https://example.com/file.zip"
```

## Project Layout

```text
api/index.js              Vercel Functions Web Handler entry
scripts/check-syntax.mjs  Cross-platform JavaScript syntax checker
scripts/smoke-vercel.mjs  Vercel runtime smoke test
src/config.js             Project metadata, service registry, health paths
src/html.js               HTML rewrite fallback for non-Cloudflare runtimes
src/i18n.js               Language detection, language switch links, and localized URLs
src/index.js              Host/path router and health endpoint
src/proxy-utils.js        Shared CORS, redirect, header, and proxy helpers
src/tools/*.js            Individual tool implementations
vercel.json               Vercel routing and build configuration
wrangler.toml             Portable Cloudflare Workers deploy configuration
wrangler.custom-domain.example.toml  Optional custom-domain configuration example
```

## Configuration

Edit `src/config.js` when adding, renaming, or documenting a tool. Edit `wrangler.toml` when changing the Cloudflare Worker name or compatibility date.

For Cloudflare custom domains, add the domain in the Cloudflare dashboard or use `wrangler.custom-domain.example.toml` as a reference after the domain is available in the target account. For Vercel custom domains, add one primary domain in the Vercel dashboard and keep the same path routes.

## Production Notes

- Keep `npm run verify` green before deploying.
- Keep `wrangler` updated; it is the local Cloudflare dev/deploy toolchain.
- Cloudflare custom domains are account-specific, so the portable default `wrangler.toml` does not hard-code one.
- Use one primary domain for the public product experience; legacy per-tool hosts are not the recommended interaction model.
- Some upstream services may have rate limits, authentication requirements, or terms of service that still apply through a proxy.

## Roadmap

- Promote test accelerators to stable after more upstream compatibility checks.
- Add configurable service domains through environment variables.
- Add structured access logs and optional request tracing.
- Add per-tool smoke tests with mocked upstream responses.
- Add deployment preview screenshots for the portal and tool pages.
