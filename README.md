# MAJ Boutique

Interactive jewelry boutique built with Next.js, React Three Fiber, and Tailwind CSS.

## Requirements

- Node.js 18+ (20+ recommended)
- npm

## Setup

```bash
npm install
```

`postinstall` downloads HDR environment maps into `public/hdri/`. If 3D lighting looks wrong, run:

```bash
npm run setup:hdri
```

## Development

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If the dev server misbehaves:

```bash
npm run dev:clean
```

## Production

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev:clean` | Clear cache and restart dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm run test:browsers` | Run Playwright E2E tests |
| `npm run setup:hdri` | Download HDR assets |

## Environment variables

Optional:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Defaults to `http://localhost:3000` when unset.

## Testing

Install Playwright browsers once:

```bash
npx playwright install
```

Start the dev server in one terminal, then run tests in another:

```bash
npm run test:browsers
```

## Push to GitHub (large 3D files)

Your jewelry models (`.glb` files) total about **527 MB**. GitHub blocks any single file over **100 MB** — that is why you see the warning for `public/table-3d.glb` (109 MB).

**Do not click "Commit Anyway"** — the push will fail.

### Step 1: Install Git LFS (one time)

Download and install from [git-lfs.com](https://git-lfs.com), then run:

```bash
git lfs install
```

### Step 2: Track large assets

From the project folder:

```bash
cd "/Users/zimal/Zimal Tajwer/The Bit Vista/MAJ Boutique/Maj Boutique"
git lfs track "*.glb"
git add .gitattributes
```

(`.gitattributes` is already set up in this repo for `*.glb` and `*.hdr`.)

### Step 3: Commit and push

```bash
git add .
git commit -m "Initial MAJ Boutique site"
git push origin main
```

Git LFS stores the heavy files separately so GitHub accepts them. Free GitHub accounts include **1 GB** of LFS storage (your models use about half of that).

## Make the website live (deploy)

GitHub stores your code — it does **not** host the running website. For a Next.js app, use **Vercel** (free, made by the Next.js team):

1. Push your code to GitHub (steps above).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New → Project** and import `Maj_Boutique`.
4. Leave the defaults (Framework: Next.js, Build: `npm run build`, Output: automatic).
5. Click **Deploy**.

Vercel builds the site and gives you a live URL like `https://maj-boutique.vercel.app`. Every push to `main` redeploys automatically.

### After deploy: set your public URL

In Vercel → Project → **Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` |

Redeploy once so SEO metadata uses the correct domain.

### If Vercel build fails on large files

Your 3D models are large. If the deploy hits size limits, host the `.glb` files on a CDN (e.g. Cloudflare R2, AWS S3) and update paths in `src/data/products.ts` — or contact Vercel support about Git LFS on your plan.

