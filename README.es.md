<p align="center">
  <a href="README.md">English</a> | <strong>Español</strong> | <a href="README.zh-CN.md">中文</a>
</p>

<h1 align="center">DevBox Workers</h1>

<p align="center">
  Caja de herramientas edge para acelerar PyPI, PyTorch, Hugging Face, GitHub, Docker, mirrors Linux, npm, Go modules, Maven, crates.io, descargas de runtimes y archivos HTTP/HTTPS.
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
  <img alt="JavaScript ESM" src="https://img.shields.io/badge/JavaScript-ESM-f7df1e?style=for-the-badge&labelColor=111827">
  <img alt="Single domain" src="https://img.shields.io/badge/single--domain-paths-2563eb?style=for-the-badge">
  <img alt="One click deploy" src="https://img.shields.io/badge/one--click-deploy-7c3aed?style=for-the-badge">
</p>

## Resumen

DevBox Workers es una aplicacion edge de un solo dominio. El modelo recomendado es publicar un dominio, por ejemplo `box.w0x7ce.eu`, y servir cada acelerador desde una ruta: `/pypi`, `/hf`, `/github`, `/docker`, `/mirrors`, `/proxy`, `/npm`, `/go`, `/maven`, `/crates`, `/downloads` y `/help`.

Mantenedor: [tianrking](https://github.com/tianrking)

Palabras clave: Cloudflare Workers proxy, Vercel Functions proxy, PyPI mirror, PyTorch wheels, Hugging Face mirror, Docker registry proxy, GitHub raw proxy, Linux mirror proxy, npm registry proxy, Go module proxy, Maven proxy, Gradle mirror, crates.io sparse registry proxy.

## Matriz de servicios

`Stable` significa recomendado para uso diario. `Test` significa implementado y cubierto por smoke tests, pero conviene validarlo en tu propio flujo antes de tratarlo como estable.

| Estado | Servicio | Ruta | Que acelera |
| --- | --- | --- | --- |
| Stable | DevBox Portal | `/` o `/box` | Panel visual y ejemplos de uso |
| Stable | Help | `/help` | Guia de rutas, uso web, comandos y configuracion en English, Español y 中文 |
| Stable | PyPI / PyTorch | `/pypi` | PyPI simple index, paquetes Python y wheels de PyTorch |
| Stable | Hugging Face | `/hf` | Modelos, datasets, API y descargas LFS |
| Stable | GitHub | `/github` | Git clone, raw files, releases y paginas |
| Stable | Docker | `/docker` UI, `/v2` API | Docker Hub y registros con prefijos `quay`, `gcr`, `k8s`, `ghcr`, `nvcr` |
| Stable | Linux Mirrors | `/mirrors` | APT, YUM, DNF, Pacman, wget y curl |
| Stable | Universal Proxy | `/proxy` | Cualquier URL HTTP/HTTPS |
| Test | npm Registry | `/npm` | npm, pnpm, yarn metadata y tarballs |
| Test | Go Modules | `/go` | GOPROXY metadata, `.mod` y `.zip` |
| Test | Maven / Gradle | `/maven` | Maven Central, Google Maven, Gradle Plugin Portal y JitPack |
| Test | crates.io Sparse | `/crates` | Cargo sparse index y paquetes `.crate` |
| Test | Downloads | `/downloads` | Runtimes, Open VSX, SourceForge, GitLab, Gitea y URLs directas |

## Despliegue

Cloudflare:

```text
https://deploy.workers.cloudflare.com/?url=https://github.com/tianrking/box-tools
```

Vercel:

```text
https://vercel.com/new/clone?repository-url=https://github.com/tianrking/box-tools
```

El `wrangler.toml` por defecto es portable: no vincula el dominio del mantenedor. Despliega primero, luego agrega tu dominio en Cloudflare o usa `wrangler.custom-domain.example.toml` como referencia.

## Ejemplos

```bash
pip install numpy -i https://box.w0x7ce.eu/pypi/simple/
export HF_ENDPOINT=https://box.w0x7ce.eu/hf
huggingface-cli download gpt2
git clone https://box.w0x7ce.eu/github/tianrking/box-tools.git
docker pull box.w0x7ce.eu/library/nginx:latest
npm install lodash --registry=https://box.w0x7ce.eu/npm/
go env -w GOPROXY=https://box.w0x7ce.eu/go,direct
curl -L -O "https://box.w0x7ce.eu/downloads/node/v22.11.0/node-v22.11.0-x64.msi"
```

## Desarrollo local

```bash
npm install
npm run verify
npm run dev
```

## Notas

- La experiencia publica recomendada usa un solo dominio y rutas.
- Los nombres de herramientas se mantienen en ingles.
- Las explicaciones y los ejemplos de Help soportan English, Español y 中文 con `?lang=es` y `?lang=zh`.
- Los limites, autenticacion y terminos de los servicios upstream siguen aplicando.
