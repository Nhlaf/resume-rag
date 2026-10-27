# RecruitBot Web - Deployment Guide

Complete guide for deploying RecruitBot frontend to production.

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production build
- [ ] All components render correctly
- [ ] Mobile responsive tested

### Environment Setup
- [ ] Production API URL configured in `.env.production`
- [ ] CORS enabled on backend for production domain
- [ ] Backend API accessible and healthy
- [ ] MongoDB connected and indexed

### Testing
- [ ] All search modes tested (Vector/BM25/Hybrid)
- [ ] Result cards click to modal
- [ ] Modal displays all candidate sections
- [ ] Mobile drawer works
- [ ] Keyboard shortcuts functional (Enter, Escape)

### Performance
- [ ] Lighthouse score > 90
- [ ] Images optimized (if any)
- [ ] Bundle size reasonable (< 500KB gzipped)
- [ ] API responses cached where appropriate

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero-config deployment
- Automatic HTTPS
- Preview deployments for PRs
- Edge network (fast globally)
- Free tier available

**Steps:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Configure**

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

4. **Deploy**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

5. **Set Environment Variables**
```bash
vercel env add VITE_API_BASE_URL production
# Enter: https://your-backend-api.com
```

6. **Custom Domain** (optional)
```bash
vercel domains add yourdomain.com
```

---

### Option 2: Netlify

**Why Netlify?**
- Simple drag-and-drop deployment
- Form handling (if needed)
- Netlify Functions (serverless)
- Free tier with SSL

**Steps:**

1. **Install Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Configure**

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

4. **Deploy**
```bash
# Build locally
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

5. **Environment Variables**

Go to: Site Settings → Build & Deploy → Environment

Add:
- `VITE_API_BASE_URL` = `https://your-backend-api.com`

---

### Option 3: AWS S3 + CloudFront

**Why AWS?**
- Full control
- Scalable
- Integrates with other AWS services
- Pay-as-you-go pricing

**Steps:**

1. **Build**
```bash
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://recruitbot-web
```

3. **Enable Static Website Hosting**
```bash
aws s3 website s3://recruitbot-web \
  --index-document index.html \
  --error-document index.html
```

4. **Upload Build**
```bash
aws s3 sync dist/ s3://recruitbot-web --delete
```

5. **Set Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::recruitbot-web/*"
    }
  ]
}
```

6. **Create CloudFront Distribution**
- Origin: S3 bucket website endpoint
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Custom Error Response: 403 → /index.html (for SPA routing)
- Cache Policy: CachingOptimized

7. **Update DNS**

Point your domain's CNAME to CloudFront distribution domain.

---

### Option 4: Docker + Any Host

**Why Docker?**
- Consistent environment
- Deploy anywhere (AWS ECS, GCP, Azure, DigitalOcean)
- Easy rollbacks

**Steps:**

1. **Create `Dockerfile`**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create `nginx.conf`**
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Security headers
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-Content-Type-Options "nosniff";
  add_header X-XSS-Protection "1; mode=block";

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

3. **Build Image**
```bash
docker build -t recruitbot-web .
```

4. **Run Locally**
```bash
docker run -p 8080:80 recruitbot-web
```

5. **Push to Registry**
```bash
# Docker Hub
docker tag recruitbot-web username/recruitbot-web
docker push username/recruitbot-web

# AWS ECR
aws ecr create-repository --repository-name recruitbot-web
docker tag recruitbot-web 123456789.dkr.ecr.us-east-1.amazonaws.com/recruitbot-web
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/recruitbot-web
```

6. **Deploy**

Deploy to your preferred container orchestration platform.

---

## 🔧 Environment Variables

### Development (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=RecruitBot
VITE_ENABLE_MOCK=false
```

### Production (`.env.production`)
```env
VITE_API_BASE_URL=https://api.recruitbot.com
VITE_APP_NAME=RecruitBot
VITE_ENABLE_MOCK=false
```

### Staging (`.env.staging`)
```env
VITE_API_BASE_URL=https://staging-api.recruitbot.com
VITE_APP_NAME=RecruitBot [Staging]
VITE_ENABLE_MOCK=false
```

## 🔐 Security Considerations

### HTTPS
- **Always use HTTPS** in production
- Redirect HTTP → HTTPS
- Use HSTS headers

### CORS
Backend must allow your frontend origin:
```javascript
// Backend CORS config
app.use(cors({
  origin: [
    'https://recruitbot.com',
    'https://www.recruitbot.com'
  ],
  credentials: true
}));
```

### Content Security Policy
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.recruitbot.com;">
```

### API Keys
- Never commit `.env` files
- Use platform-specific secrets management
- Rotate keys regularly

## 📊 Monitoring

### Error Tracking
Integrate Sentry or similar:

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Analytics
Add Google Analytics or Plausible:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Performance Monitoring
- Lighthouse CI
- Web Vitals
- Vercel Analytics (if using Vercel)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

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
      
      - name: Run type check
        run: npm run type-check
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Production Testing

After deployment, test:

1. **Health Check**
```bash
curl https://recruitbot.com
# Should return 200 OK
```

2. **API Connectivity**
- Open app → Search → Verify results load
- Check browser DevTools Network tab
- Ensure CORS headers present

3. **Performance**
```bash
npx lighthouse https://recruitbot.com --view
```

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

4. **Mobile Testing**
- Test on actual devices
- Use BrowserStack or similar
- Check touch interactions

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

### Blank Page After Deployment
- Check browser console for errors
- Verify base path in `vite.config.ts`
- Check SPA routing (redirects to `/index.html`)

### API CORS Errors
- Verify backend CORS allows your domain
- Check preflight OPTIONS requests succeed
- Ensure credentials handled correctly

### Slow Load Times
- Enable compression (gzip/brotli)
- Use CDN for static assets
- Lazy load components
- Optimize bundle size

## 📞 Support

For deployment issues, contact:
- Email: devops@recruitbot.com
- Slack: #deployments
- Docs: https://docs.recruitbot.com/deployment

---

**Last updated**: 2026-09-18
