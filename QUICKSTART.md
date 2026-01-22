# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas account)
- Google OAuth credentials (optional, for Google login)
- GitHub OAuth app (optional, for GitHub login)

## Step 1: Install Dependencies

### Backend
```bash
npm install
```

### Frontend
```bash
cd threadstudioss-react
npm install
```

## Step 2: Environment Configuration

### Backend (.env file in root)
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/threadstudioss
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/threadstudioss

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_here

# OAuth (Optional - leave empty if not using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend URL
CLIENT_URL=http://localhost:5173

# Session
SESSION_SECRET=your_session_secret_here
```

### Frontend (.env.local in threadstudioss-react/)
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 3: Run the Application

### Option 1: Run Both Servers Simultaneously
```bash
# From the root directory
npm run dev
```

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd threadstudioss-react
npm run dev
```

## Step 4: Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Step 5: Test the Application

### Create Admin User (Optional)
If you want to create an admin user, you can modify the seed script:

```bash
node scripts/seed.js
```

Or register normally and manually update your user role in MongoDB:
```javascript
db.users.updateOne(
  { email: 'your-email@example.com' },
  { $set: { role: 'admin' } }
)
```

## Default Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product details
- `/about` - About page
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Requires Login)
- `/cart` - Shopping cart
- `/profile` - User profile
- `/orders` - Order history

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/github` - GitHub OAuth login
- `GET /api/products` - Get all products
- `POST /api/orders` - Create new order
- `GET /api/users/profile` - Get user profile

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally: `mongod`
- Or check your MongoDB Atlas connection string

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port: `npx kill-port 5000`

### OAuth Not Working
- Make sure you've configured OAuth apps correctly (see OAUTH_SETUP.md)
- Check that redirect URLs match in your OAuth app settings
- Verify CLIENT_URL in backend .env matches your frontend URL

### CORS Errors
- Ensure CLIENT_URL in backend .env matches your frontend URL
- Check that cookies are enabled in your browser

## Next Steps

1. ✅ Configure OAuth (see OAUTH_SETUP.md)
2. ✅ Add products through admin interface or MongoDB directly
3. ✅ Test user registration and login
4. ✅ Test shopping cart and checkout
5. ✅ Review deployment guide (DEPLOYMENT.md) when ready to deploy

## Development Tips

### Hot Reload
Both frontend and backend have hot reload enabled:
- Frontend: Vite automatically reloads on file changes
- Backend: nodemon restarts server on file changes

### Database Management
- Use MongoDB Compass for visual database management
- Or use MongoDB shell: `mongosh`

### API Testing
- Use Thunder Client (VS Code extension)
- Or Postman/Insomnia for API testing
- Or curl commands:
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## Support

For detailed setup instructions:
- **OAuth Setup:** See OAUTH_SETUP.md
- **Deployment:** See DEPLOYMENT.md
- **Project Overview:** See README.md
