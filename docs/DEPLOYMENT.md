# NotePay Deployment Guide

This guide covers deploying NotePay to production environments.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/notepay)

### Option 2: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-org/notepay)

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Supabase project created and configured
- [ ] Pinata account set up with API keys
- [ ] Environment variables configured
- [ ] Database tables created
- [ ] API keys tested in development

### 2. Code Preparation
- [ ] All features tested locally
- [ ] Build process working (`npm run build`)
- [ ] No console errors in production build
- [ ] All environment variables using `VITE_` prefix
- [ ] Sensitive data not committed to repository

### 3. Performance Optimization
- [ ] Images optimized and compressed
- [ ] Bundle size analyzed and optimized
- [ ] Unused dependencies removed
- [ ] Code splitting implemented where needed

## 🔧 Environment Configuration

### Required Environment Variables

Create these environment variables in your deployment platform:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your-pinata-api-key
VITE_PINATA_SECRET_KEY=your-pinata-secret-key

# Base RPC Configuration (optional)
VITE_BASE_RPC_URL=https://mainnet.base.org
```

### Optional Environment Variables

```bash
# Custom RPC endpoints for better performance
VITE_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your-api-key

# Analytics and monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

## 🌐 Vercel Deployment

### Automatic Deployment

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add all required environment variables
   - Make sure to add them for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get your production URL

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_PINATA_API_KEY": "@pinata-api-key",
    "VITE_PINATA_SECRET_KEY": "@pinata-secret-key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🌍 Netlify Deployment

### Automatic Deployment

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Environment Variables**
   - Go to Site Settings > Environment Variables
   - Add all required environment variables

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

### Netlify Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy "strict-origin-when-cross-origin";

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Docker Commands

```bash
# Build image
docker build -t notepay .

# Run container
docker run -p 3000:80 notepay

# Run with environment variables
docker run -p 3000:80 \
  -e VITE_SUPABASE_URL=your-url \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  notepay
```

## ☁️ AWS Deployment

### S3 + CloudFront

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 bucket**
   ```bash
   aws s3 mb s3://notepay-app
   ```

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://notepay-app --delete
   ```

4. **Configure S3 for static hosting**
   ```bash
   aws s3 website s3://notepay-app --index-document index.html --error-document index.html
   ```

5. **Create CloudFront distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error pages: 404 → /index.html (for SPA routing)

## 🔍 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Wallet connection works
- [ ] Payment creation works
- [ ] File upload to IPFS works
- [ ] Transaction sharing works
- [ ] Notifications work
- [ ] All API integrations work

### 2. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### 3. Security Tests
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] No sensitive data exposed
- [ ] API keys not in client code
- [ ] CSP headers configured

## 📊 Monitoring & Analytics

### Error Tracking with Sentry

1. **Install Sentry**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Configure Sentry**
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: process.env.VITE_SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

### Analytics with Google Analytics

1. **Add GA4 tracking**
   ```html
   <!-- Google tag (gtag.js) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'GA_MEASUREMENT_ID');
   </script>
   ```

### Performance Monitoring

1. **Web Vitals**
   ```javascript
   import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

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
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_PINATA_API_KEY: ${{ secrets.VITE_PINATA_API_KEY }}
        VITE_PINATA_SECRET_KEY: ${{ secrets.VITE_PINATA_SECRET_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check environment variables are set
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Calls Fail**
   - Verify API keys are correct
   - Check CORS settings
   - Verify network connectivity

3. **Wallet Connection Issues**
   - Check WalletConnect project ID
   - Verify network configuration
   - Check browser compatibility

4. **File Upload Fails**
   - Verify Pinata API keys
   - Check file size limits
   - Verify network connectivity

### Debug Commands

```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm run build -- --analyze

# Check for unused dependencies
npx depcheck

# Audit security vulnerabilities
npm audit
```

## 📈 Scaling Considerations

### Performance Optimization
- Implement code splitting
- Use CDN for static assets
- Enable gzip compression
- Optimize images and fonts
- Implement service worker for caching

### Database Optimization
- Add database indexes
- Implement connection pooling
- Use read replicas for scaling
- Monitor query performance

### API Rate Limiting
- Implement client-side rate limiting
- Use caching for frequently accessed data
- Monitor API usage and limits
- Implement graceful degradation

---

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**
   - Set up alerts for errors and performance issues
   - Monitor API usage and costs
   - Track user engagement metrics

2. **Gather Feedback**
   - Collect user feedback
   - Monitor support requests
   - Track feature usage

3. **Iterate and Improve**
   - Plan feature updates
   - Optimize based on usage patterns
   - Scale infrastructure as needed

For additional support, check the [main README](../README.md) or open an issue on GitHub.
