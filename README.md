# זיפ — המתפרה שלך

Static web app (single page): design a garment on a 3D human fitted to your measurements, see the flat pattern on the cutting table, export / print 1:1, share to stories.

- `index.html` — studio (pattern engine, 3D, table, export, print, share)
- `human.js` — realistic human avatar: loads `human.glb`, fits it to measurements and to the garment, blinking / eye / head idle motion
- `chat.js` — in-app assistant (Hebrew commands → actions on the garment, sewing explanations)
- `manifest.webmanifest`, icons — PWA / add to home screen

No build step. Serve the folder as static files.

## Deploy (Vercel project `mida-studio`)
Only `index.html` and `vercel.json` are uploaded to Vercel. Every other file is served from this repo
through jsDelivr, pinned to a commit in `vercel.json` (`@<commit>`). To ship a change: push, then
redeploy `index.html` + `vercel.json` with the new commit hash.
