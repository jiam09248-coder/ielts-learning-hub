# IELTS Learning Hub

本项目只维护一份源代码：本地项目 / Git 仓库。Cloudflare 只是备案期间的临时预览部署目标，阿里云是未来正式生产部署目标。

## Deployment Model

```text
local source code / Git
        |
        | npm run build
        v
dist static files
        |
        +--> temporary Cloudflare deployment
        |
        +--> final Aliyun server / OSS / CDN deployment
```

## Daily Development

```bash
npm install
npm run dev
```

Only edit local source files. Do not edit deployed files directly in Cloudflare or on the server.

## Inner Test Operations

第一批个人用户内测的账号发放、视频验收和反馈记录流程见 [docs/inner-test-operations.md](docs/inner-test-operations.md)。

## Build For Aliyun

```bash
npm run build
```

This creates `dist/`, which can be uploaded to an Aliyun server or static hosting service. For an Nginx server, point the site root to this `dist/` directory and configure SPA fallback to `index.html`.

## Temporary Cloudflare Preview

```bash
npm run build:cloudflare
npm run deploy:cloudflare
```

Cloudflare-specific configuration lives in `vite.cloudflare.config.ts` and `wrangler.jsonc`. If Cloudflare is no longer needed, these files and scripts can be ignored or removed.

## Video URLs

During the temporary phase, `.env` may point to Cloudflare R2 video URLs. Before Aliyun launch, replace `VITE_VIDEO_001_URL`, `VITE_VIDEO_PART1_STUDY_WORK_001_URL`, and other `VITE_VIDEO_*_URL` values with Aliyun OSS/CDN URLs, then run `npm run build` again.

The default local video base is `/videos` in development and `/oss-videos` in production. Override it with `VITE_VIDEO_BASE_URL`; do not add a domain-specific fallback in source code. Every video, catalog entry, access level, title, duration, and video filename is maintained in `src/data/contentManifest.ts`.

## Content validation

Run the content check before committing new lessons:

```bash
npm run validate:content
```

This verifies that all lesson data files are registered, metadata has a valid duration, IDs are unique, and exactly three videos are marked as free.

## Authentication boundary

The current preset-account login is an inner-test convenience only. Local storage can be modified by the user, and static video/content assets can be inspected in the browser. Before formal paid access, add a small server-side login/session layer and signed video URLs. The recommended low-cost path is Cloudflare Worker + KV/D1; the current frontend guard must not be treated as content security.
