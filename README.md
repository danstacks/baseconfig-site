# BaseConfig.tech

Personal branding website for Dan Stacks - Infrastructure & Technology content.

## Structure

```
baseconfig-site/
├── index.html          # Main landing page
├── tools/
│   └── infra-planner/  # Infrastructure Planning Calculator
└── README.md
```

## Deployment to Cloudflare Pages

### 1. Create GitHub Repository

```bash
cd baseconfig-site
git init
git add .
git commit -m "Initial commit - BaseConfig website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baseconfig-site.git
git push -u origin main
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub account
4. Select the `baseconfig-site` repository
5. Configure build settings:
   - **Build command**: (leave empty - static site)
   - **Build output directory**: `/` (root)
6. Click **Save and Deploy**

### 3. Add Custom Domain

1. In Cloudflare Pages, go to your project
2. Click **Custom domains** → **Set up a custom domain**
3. Enter `baseconfig.tech`
4. Follow DNS configuration instructions

## Local Development

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```

## Social Links

- YouTube: https://www.youtube.com/@BaseConfig
- TikTok: https://www.tiktok.com/@baseconfig
- Instagram: https://www.instagram.com/baseconfig/
- LinkedIn: https://www.linkedin.com/in/dan-stacks/
