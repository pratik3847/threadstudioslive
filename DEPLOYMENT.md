# 🚀 Deployment Guide - The Thread Studioss

Complete step-by-step guide to deploy your MERN stack application to production.

## 📋 Pre-Deployment Checklist

- [ ] All code committed to GitHub
- [ ] OAuth credentials configured (Google & GitHub)
- [ ] MongoDB Atlas database created
- [ ] Environment variables documented
- [ ] Test locally with production-like settings

## 🗄️ Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with Google or Email
3. Choose FREE tier (M0 Sandbox)

### 1.2 Create Cluster

1. Click "Build a Database"
2. Choose "Shared" (FREE)
3. Select cloud provider (AWS recommended)
4. Choose region closest to your users
5. Cluster Name: `ThreadStudioss`
6. Click "Create"

### 1.3 Setup Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `threadstudioss-admin`
5. Password: Click "Autogenerate Secure Password" and **SAVE IT**
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.4 Setup Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String

1. Go to "Database" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 4.1 or later
4. Copy the connection string:
```
mongodb+srv://threadstudioss-admin:<password>@threadstudioss.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Replace `<password>` with your actual password
6. Add database name before `?`: `/threadstudioss?`
7. **SAVE THIS** - you'll need it for Render

## 🖥️ Step 2: Deploy Backend to Render

### 2.1 Push Code to GitHub

```bash
cd d:\thradstudiossdeploy
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/threadstudioss.git
git push -u origin main
```

### 2.2 Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 2.3 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `threadstudioss` repository

### 2.4 Configure Service

- **Name**: `threadstudioss-api`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server-new.js`
- **Instance Type**: Free

### 2.5 Add Environment Variables

Click "Advanced" → Add Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://threadstudioss-admin:YOUR_PASSWORD@threadstudioss.xxxxx.mongodb.net/threadstudioss?retryWrites=true&w=majority
JWT_SECRET=<generate-random-64-char-string>
JWT_REFRESH_SECRET=<generate-random-64-char-string>
CLIENT_URL=https://your-app.vercel.app
SESSION_SECRET=<generate-random-64-char-string>
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://threadstudioss-api.onrender.com/api/auth/google/callback
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://threadstudioss-api.onrender.com/api/auth/github/callback
```

**Generate secure secrets:**
```bash
# Run in terminal to generate random strings
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.6 Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your API will be available at: `https://threadstudioss-api.onrender.com`
4. Test health check: `https://threadstudioss-api.onrender.com/api/health`

### 2.7 Seed Production Database (Optional)

1. In Render dashboard, go to your service
2. Click "Shell" tab
3. Run: `npm run seed`

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Prepare Frontend for Deployment

```bash
cd threadstudioss-react
```

Create/update `.env.production`:
```env
VITE_API_URL=https://threadstudioss-api.onrender.com/api
```

### 3.4 Deploy to Vercel

```bash
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name: `threadstudioss`
- Directory: `./` (current directory)
- Overwrite settings? **N**

### 3.5 Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://threadstudioss-api.onrender.com/api`
   - **Environment**: Production, Preview, Development
5. Click "Save"

### 3.6 Redeploy

```bash
vercel --prod
```

Your frontend will be available at: `https://threadstudioss.vercel.app`

## 🔐 Step 4: Update OAuth Settings

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. Add to Authorized JavaScript origins:
   - `https://threadstudioss.vercel.app`
   - `https://threadstudioss-api.onrender.com`
6. Add to Authorized redirect URIs:
   - `https://threadstudioss-api.onrender.com/api/auth/google/callback`
7. Click "Save"

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Update:
   - Homepage URL: `https://threadstudioss.vercel.app`
   - Authorization callback URL: `https://threadstudioss-api.onrender.com/api/auth/github/callback`
4. Click "Update application"

## 🔄 Step 5: Update Backend Environment

1. Go to Render dashboard
2. Select your service
3. Go to "Environment"
4. Update `FRONTEND_URL`:
   - Value: `https://threadstudioss.vercel.app`
5. Click "Save Changes"
6. Service will automatically redeploy

## ✅ Step 6: Testing

### Test API

```bash
# Health check
curl https://threadstudioss-api.onrender.com/api/health

# Register test user
curl -X POST https://threadstudioss-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Test Frontend

1. Visit `https://threadstudioss.vercel.app`
2. Test registration/login
3. Test Google OAuth login
4. Test GitHub OAuth login
5. Add products to cart
6. Create test order
7. Check admin dashboard (if admin)

## 📊 Step 7: Monitor & Maintain

### Render Monitoring

1. Dashboard shows:
   - Service status
   - Deploy logs
   - Metrics (CPU, Memory)
   - Recent deploys

2. View logs:
   - Click "Logs" tab
   - Monitor errors and requests

### Vercel Monitoring

1. Dashboard shows:
   - Deployment status
   - Analytics
   - Performance metrics

### Set up Alerts

**Render:**
- Go to service → Settings → Health Checks
- Enable email notifications for failures

**Vercel:**
- Dashboard → Settings → Notifications
- Enable deployment notifications

## 🐛 Troubleshooting

### Backend Issues

**Service won't start:**
- Check environment variables are all set
- View logs in Render dashboard
- Verify MongoDB connection string is correct
- Check Node.js version compatibility

**Database connection error:**
- Verify MongoDB Atlas whitelist includes 0.0.0.0/0
- Check connection string has correct password
- Ensure database user has correct permissions

**OAuth not working:**
- Verify callback URLs match exactly in OAuth settings
- Check environment variables are correctly set
- Test locally first, then deploy

### Frontend Issues

**API calls failing:**
- Check `VITE_API_URL` is correct in Vercel
- Verify CORS is configured correctly in backend
- Test API endpoint directly with curl

**OAuth redirect fails:**
- Check callback URLs in OAuth providers
- Verify `FRONTEND_URL` in backend matches Vercel URL
- Check browser console for errors

**Build fails:**
- Check package.json scripts
- Verify all dependencies are in package.json
- Check Node.js version

## 🔄 Continuous Deployment

### Automatic Deploys

**Render:**
- Auto-deploys on git push to main branch
- Configure in Settings → Build & Deploy

**Vercel:**
- Auto-deploys on git push
- Creates preview deployments for PRs
- Production deployment on merge to main

### Manual Deploy

**Render:**
- Click "Manual Deploy" → "Deploy latest commit"

**Vercel:**
```bash
vercel --prod
```

## 💡 Best Practices

1. **Never commit `.env` files** - Use `.env.example` templates
2. **Use strong secrets** - Generate random 64-character strings
3. **Enable HTTPS** - Both platforms provide this by default
4. **Monitor logs regularly** - Catch errors early
5. **Test locally first** - Use production-like environment variables
6. **Backup database** - MongoDB Atlas has automatic backups
7. **Use environment-specific configs** - Different settings for dev/prod
8. **Set up alerts** - Get notified of deployment failures
9. **Document changes** - Keep README updated
10. **Version control** - Commit regularly with clear messages

## 🎉 Success!

Your application is now live!

- **Frontend**: https://threadstudioss.vercel.app
- **Backend API**: https://threadstudioss-api.onrender.com
- **Database**: MongoDB Atlas

### Share Your Project

- Add to your resume/portfolio
- Share on LinkedIn
- Add to GitHub profile
- Include in job applications

### Next Steps

- Add payment gateway integration
- Implement email notifications
- Add product reviews
- Create admin panel
- Add analytics
- Optimize performance
- Add PWA support

---

**Need help?** Check the troubleshooting section or open an issue on GitHub.
