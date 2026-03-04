# SummitReady — AI Adventure Readiness Prototype

## What This Is
A React app (Vite) that runs an interactive readiness assessment for mountain adventures. Includes email capture and feedback collection on the results screen.

## Project Structure
```
summitready-deploy/
├── index.html            # Entry HTML
├── package.json          # Dependencies (React 18 + Vite 5)
├── vite.config.js        # Vite config with React plugin
├── .gitignore
├── src/
│   ├── main.jsx          # React entry point
│   └── SummitReady.jsx   # Full app component (all-in-one)
└── AGENT_INSTRUCTIONS.md # Deployment steps (this file)
```

## Deployment Instructions

### Option A: Deploy to Netlify (Recommended)

1. **Initialize and push to GitHub:**
   ```bash
   cd summitready-deploy
   git init
   git add .
   git commit -m "Initial commit - SummitReady prototype"
   gh repo create summitready --public --push --source=.
   ```

2. **Deploy to Netlify:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect the GitHub repo
   - Build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click Deploy

3. **Result:** You'll get a URL like `https://summitready.netlify.app`

### Option B: Deploy to Vercel

1. Push to GitHub (same as step 1 above)
2. Go to https://vercel.com/new
3. Import the GitHub repo
4. Vercel auto-detects Vite — just click Deploy
5. Result: URL like `https://summitready.vercel.app`

### Option C: Deploy via CLI (no browser needed)

```bash
# Netlify CLI
npm install -g netlify-cli
cd summitready-deploy
npm install
npm run build
netlify deploy --prod --dir=dist

# OR Vercel CLI
npm install -g vercel
cd summitready-deploy
npm install
npm run build
vercel --prod
```

## Local Development

```bash
cd summitready-deploy
npm install
npm run dev
# Opens at http://localhost:5173
```

## Notes
- The email capture and feedback forms are UI-only — they show confirmation states but don't send data anywhere yet. To wire them up, add Formspree endpoints (free tier: 50 submissions/month) or similar.
- All styles are inline — no CSS files or Tailwind needed.
- The only external dependency is Google Fonts (DM Sans + Playfair Display), loaded via link tag.
- No environment variables needed.
