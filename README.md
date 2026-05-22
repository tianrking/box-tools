# DevBox Workers

Cloudflare Workers monorepo for the w0x7ce developer accelerator toolbox.

## Tools

- `box.w0x7ce.eu`: portal page
- `pypi.w0x7ce.eu`: PyPI and PyTorch proxy
- `hf.w0x7ce.eu`: Hugging Face proxy
- `github.w0x7ce.eu`: GitHub proxy
- `docker.w0x7ce.eu`: Docker registry proxy
- `mirrors.w0x7ce.eu`: Linux mirror pass-through proxy
- `proxy.w0x7ce.eu`: universal file proxy

## Layout

```text
src/index.js        # Host/path router
src/tools/*.js      # One Worker module per tool
wrangler.toml       # Cloudflare deployment config
package.json        # Dev/deploy scripts
```

## Local Development

```bash
npm install
npm run check
npm run dev
```

When running on a single local Worker host, use path prefixes:

```text
/box
/pypi
/hf
/github
/docker
/mirrors
/proxy
/proxy/https://example.com/file.zip
```

## Deploy

```bash
npm run deploy
```

Make sure the custom domains in `wrangler.toml` exist in the same Cloudflare account.
