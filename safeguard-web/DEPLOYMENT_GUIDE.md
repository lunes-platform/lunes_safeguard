# SafeGard Frontend - Deployment Guide

## 📋 Overview

This guide covers the deployment process for the SafeGard frontend application, including production builds, performance optimization, and deployment to various platforms.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run tests
npm run test
npm run test:e2e

# Analyze bundle
npm run analyze
```

## 🏗️ Build Process

### Production Build
```bash
npm run build
```

The build process:
- ✅ Code splitting with lazy loading
- ✅ Bundle optimization with manual chunks
- ✅ CSS optimization with Tailwind purging
- ✅ Asset optimization (images, fonts)
- ✅ Service worker generation
- ✅ Source maps for debugging

### Build Output
```
dist/
├── assets/
│   ├── index-[hash].js          # Main bundle
│   ├── react-vendor-[hash].js   # React libraries
│   ├── router-vendor-[hash].js  # React Router
│   ├── i18n-vendor-[hash].js    # Internationalization
│   ├── modals-[hash].js         # Modal components
│   └── index-[hash].css         # Optimized CSS
├── index.html                   # Entry point
├── manifest.json               # PWA manifest
└── sw.js                       # Service worker
```

## 📊 Performance Targets

- **Bundle Size**: <180KB gzipped
- **Lighthouse Performance**: ≥85
- **Lighthouse SEO**: ≥95
- **Lighthouse Accessibility**: ≥95
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s

## 🌐 Deployment Options

### 1. Netlify (Recommended)
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_APP_TITLE=SafeGard
VITE_APP_DESCRIPTION=Primeiro protocolo descentralizado de garantias para Web3
```

### 2. Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Static Hosting (AWS S3, GitHub Pages)
```bash
# Build and upload dist/ folder
npm run build
# Upload dist/ contents to your static hosting
```

### 4. Docker
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Environment Configuration

### Environment Variables
```env
# App Configuration
VITE_APP_TITLE=SafeGard
VITE_APP_DESCRIPTION=Primeiro protocolo descentralizado de garantias para Web3
VITE_APP_URL=https://safeguard.lunes.io

# API Configuration (when backend is ready)
VITE_API_BASE_URL=https://api.safeguard.lunes.io
VITE_BLOCKCHAIN_RPC=https://rpc.lunes.io

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Build-time Configuration
```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
```

## 🔒 Security Configuration

### Content Security Policy
```html
<!-- Already configured in index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com data:;
  connect-src 'self' ws: wss:;
  worker-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Security Headers (Nginx)
```nginx
# nginx.conf
server {
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
}
```

## 📱 PWA Configuration

### Service Worker
- ✅ Static asset caching
- ✅ Dynamic content caching
- ✅ Offline fallback
- ✅ Background sync ready

### Manifest
- ✅ App icons (72x72 to 512x512)
- ✅ Theme colors
- ✅ Display mode: standalone
- ✅ Shortcuts configured

## 🧪 Testing & Quality Assurance

### Pre-deployment Checklist
```bash
# Run all tests
npm run test
npm run test:e2e

# Check build
npm run build
npm run preview

# Analyze bundle
npm run analyze

# Lighthouse audit
npx lighthouse http://localhost:4173 --output=html --output-path=./lighthouse-report.html
```

### Performance Monitoring
```bash
# Bundle analyzer
npm run analyze

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy SafeGard Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_APP_URL: ${{ secrets.APP_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/deploy@master
        with:
          publish-dir: ./dist
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Bundle Too Large**
   ```bash
   # Analyze bundle
   npm run analyze
   # Check for unnecessary imports
   ```

3. **CSP Violations**
   - Check browser console
   - Update CSP headers
   - Verify external resources

4. **PWA Not Installing**
   - Check manifest.json validity
   - Verify HTTPS deployment
   - Check service worker registration

### Performance Issues
```bash
# Check bundle size
npm run analyze

# Lighthouse audit
npx lighthouse https://your-domain.com

# Check Core Web Vitals
# Use Chrome DevTools Performance tab
```

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

## 🆘 Support

For deployment issues:
1. Check this guide first
2. Review build logs
3. Test locally with `npm run preview`
4. Check browser console for errors
5. Verify environment variables

---

**Last Updated**: December 2024  
**Version**: 1.0.0
