# Gym Manager Automation – guide website

One-page static website for the "n8n Gym Manager Automation: Complete Setup Guide" ebook.
No build step: just `index.html` + `_headers`.

## Deploy on Cloudflare Pages

**Option A – Dashboard (Git):**
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pick this repo and branch.
3. Framework preset: **None**. Build command: *(leave empty)*. Build output directory: `gym-automation-site`.
4. Save and Deploy.

**Option B – Direct upload:** Workers & Pages → Create → Pages → Upload assets → drag the `gym-automation-site` folder.

**Option C – Wrangler CLI:**
```
npx wrangler pages deploy gym-automation-site --project-name gym-manager-guide
```
