# OAuth Setup Guide

## 🔐 Setting Up Google OAuth

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "The Thread Studioss"
4. Click "Create"

### Step 2: Enable Google+ API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" and click "Create"
3. Fill in:
   - App name: The Thread Studioss
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Click "Save and Continue"
5. Skip "Scopes" → Click "Save and Continue"
6. Add test users (your email) → Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Name: "Thread Studioss Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5000`
   - `https://your-frontend-url.vercel.app` (production)
6. Add Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://your-api.onrender.com/api/auth/google/callback` (production)
7. Click "Create"
8. Copy **Client ID** and **Client Secret**

### Step 5: Add to .env

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## 🐙 Setting Up GitHub OAuth

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" → "New OAuth App"

### Step 2: Fill in Application Details

- **Application name**: The Thread Studioss
- **Homepage URL**: `http://localhost:3000`
- **Application description**: E-commerce platform for handcrafted products
- **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
- Click "Register application"

### Step 3: Get Credentials

1. You'll see the **Client ID** immediately
2. Click "Generate a new client secret"
3. Copy the **Client Secret** (you won't see it again!)

### Step 4: For Production

1. Click "Update application"
2. Add production URLs:
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-api.onrender.com/api/auth/github/callback`

### Step 5: Add to .env

```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
```

## ✅ Testing OAuth

### Test Google OAuth

1. Start your backend: `npm run dev`
2. Start your frontend: `cd threadstudioss-react && npm run dev`
3. Go to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Select your Google account
6. You should be redirected back logged in!

### Test GitHub OAuth

1. Follow same steps as above
2. Click "Continue with GitHub"
3. Authorize the application
4. You should be redirected back logged in!

## 🔧 Troubleshooting

### "redirect_uri_mismatch" Error

**Problem**: OAuth redirect URI doesn't match

**Solution**: 
- Check that callback URLs in Google/GitHub match exactly
- Include both development and production URLs
- No trailing slashes
- Check protocol (http vs https)

### "access_denied" Error

**Problem**: User canceled OAuth or insufficient permissions

**Solution**:
- Make sure OAuth consent screen is configured
- Add your email as a test user
- Check that you requested correct scopes

### OAuth works locally but not in production

**Problem**: Production URLs not configured

**Solution**:
- Add production URLs to OAuth app settings
- Update .env.production with production URLs
- Redeploy backend

## 📋 Production Checklist

- [ ] Update Google OAuth redirect URIs with production URL
- [ ] Update GitHub OAuth callback URL with production URL
- [ ] Set FRONTEND_URL in backend .env to production Vercel URL
- [ ] Set VITE_API_URL in frontend .env to production Render URL
- [ ] Test OAuth flows in production
- [ ] Verify JWT tokens are working
- [ ] Check that user data is saved correctly

## 🎉 You're Done!

Your OAuth authentication is now set up! Users can:
- Register/Login with email & password
- Login with Google account
- Login with GitHub account

All methods create the same user experience and maintain session with JWT tokens.
