# 🚀 Deployment Guide - TalentVoice

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

#### Deploy Backend to Railway

1. **Sign up at Railway.app**
   ```
   https://railway.app/
   ```

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Configure Environment Variables**
   ```
   PORT=3001
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate
   OPENAI_API_KEY=your_openai_key
   ```

4. **Set Start Command**
   ```
   node server/index.js
   ```

5. **Get Backend URL**
   - Copy the generated URL (e.g., `https://your-app.railway.app`)

#### Deploy Frontend to Vercel

1. **Sign up at Vercel.com**
   ```
   https://vercel.com/
   ```

2. **Import Project**
   - Click "New Project"
   - Import from GitHub
   - Select your repository

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable**
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

5. **Update API Calls**
   In `client/src/components/*.jsx`, replace `/api/` with:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || '/api'
   ```

6. **Deploy**
   - Click "Deploy"
   - Get your URL (e.g., `https://talenvoice.vercel.app`)

---

### Option 2: Render (Full Stack)

1. **Sign up at Render.com**
   ```
   https://render.com/
   ```

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository

3. **Configure Service**
   ```
   Name: talenvoice-backend
   Environment: Node
   Build Command: npm install
   Start Command: node server/index.js
   ```

4. **Add Environment Variables**
   ```
   PORT=3001
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate
   OPENAI_API_KEY=your_openai_key
   ```

5. **Create Static Site for Frontend**
   - New → Static Site
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

---

### Option 3: AWS (Production Grade)

#### Backend on EC2

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Open ports: 22, 3001

2. **SSH and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Clone repository
   git clone your-repo-url
   cd talenvoice
   
   # Install dependencies
   npm install
   
   # Create .env
   nano .env
   # Add your environment variables
   
   # Install PM2
   sudo npm install -g pm2
   
   # Start application
   pm2 start server/index.js --name talenvoice
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/talenvoice
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/talenvoice /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

#### Frontend on S3 + CloudFront

1. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Create S3 Bucket**
   - Name: talenvoice-frontend
   - Enable static website hosting
   - Upload `dist/` contents

3. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Set default root object: `index.html`

4. **Update API URL**
   - Set environment variable to EC2 URL
   - Rebuild and redeploy

---

## Environment Variables Reference

### Backend (.env)
```env
PORT=3001
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
```

### Frontend (Vercel/Render)
```env
VITE_API_URL=https://your-backend-url.com
```

---

## Post-Deployment Checklist

- [ ] Backend is accessible at `/api/resumes`
- [ ] Frontend loads correctly
- [ ] File upload works
- [ ] Chat interface responds
- [ ] Agora voice chat connects
- [ ] Analytics dashboard displays
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled
- [ ] Environment variables are set
- [ ] Error logging is configured

---

## Monitoring & Maintenance

### Railway
- Built-in metrics dashboard
- View logs in real-time
- Auto-scaling available

### Vercel
- Analytics dashboard
- Performance insights
- Automatic deployments on git push

### AWS
```bash
# View PM2 logs
pm2 logs talenvoice

# Monitor resources
pm2 monit

# Restart application
pm2 restart talenvoice
```

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Railway
1. Go to Settings → Domains
2. Add custom domain
3. Update CNAME record

---

## Troubleshooting

### CORS Errors
Add to `server/index.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.com'],
  credentials: true
}));
```

### File Upload Issues
Ensure `uploads/` directory exists:
```javascript
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
```

### Agora Connection Fails
- Verify App ID and Certificate
- Check firewall rules
- Ensure HTTPS is enabled

---

## Cost Estimates

### Free Tier (Hobby Projects)
- **Vercel**: Free (100GB bandwidth)
- **Railway**: $5/month (500 hours)
- **Render**: Free tier available
- **Total**: $0-5/month

### Production (100 users/day)
- **AWS EC2**: $10/month (t2.micro)
- **AWS S3**: $1/month
- **CloudFront**: $5/month
- **Agora**: Free (10,000 minutes/month)
- **OpenAI**: $10-20/month
- **Total**: $26-36/month

---

## Security Best Practices

1. **Never commit .env files**
2. **Use HTTPS everywhere**
3. **Implement rate limiting**
4. **Validate file uploads**
5. **Sanitize user inputs**
6. **Keep dependencies updated**
7. **Use environment-specific configs**
8. **Enable CORS selectively**
9. **Implement authentication** (for production)
10. **Regular security audits**

---

## Scaling Considerations

### Database
- Move from in-memory to MongoDB/PostgreSQL
- Implement connection pooling
- Add caching layer (Redis)

### File Storage
- Use S3 for resume storage
- Implement CDN for static assets
- Add file size limits

### API
- Implement rate limiting
- Add request queuing
- Use load balancer
- Enable auto-scaling

---

**Need Help?** Check the main documentation or create an issue on GitHub.
