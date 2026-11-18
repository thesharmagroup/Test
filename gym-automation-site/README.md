# GymPilot – Gym Manager Automation service website

Gym owners ko "Gym Manager Automation" service (Google Sheet + n8n + WhatsApp) bechne ke liye one-page website.
No build step: just `index.html` + `_headers`.

## Apni details badlo
`index.html` mein neeche `<script>` ke shuru mein `CONFIG` block hai. Sirf wahi edit karo:
brand naam, WhatsApp number (91 + 10 digit), email, shehar, setup price.

## Deploy on Cloudflare Pages
- **Git:** Workers & Pages → Create → Pages → Connect to Git → repo chuno. Framework preset **None**, build command empty, build output directory `gym-automation-site`.
- **Direct upload:** Workers & Pages → Create → Pages → Upload assets → is folder (ya iski zip) ko upload karo.
