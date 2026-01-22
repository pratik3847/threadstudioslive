# 🧶 The Thread Studioss - Full Stack E-Commerce Platform

A professional MERN stack e-commerce application for handcrafted crochet products, featuring JWT authentication with OAuth (Google & GitHub), complete shopping cart functionality, and order management system.

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Express.js](https://img.shields.io/badge/Express.js-Backend-blue)
![React](https://img.shields.io/badge/React-Frontend-blue)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![OAuth](https://img.shields.io/badge/OAuth-2.0-red)

## 🌟 Key Features

### Authentication & Authorization
- ✅ **JWT-based authentication** with access & refresh tokens
- ✅ **OAuth 2.0 integration** (Google & GitHub)
- ✅ **Secure password hashing** with bcrypt
- ✅ **Role-based access control** (Customer & Admin)
- ✅ **Session management** with automatic token refresh

### E-Commerce Functionality
- ✅ **Product catalog** with categories, search & filters
- ✅ **Shopping cart** with persistent storage
- ✅ **Order management** with status tracking
- ✅ **Inventory management**
- ✅ **Admin dashboard** with statistics
- ✅ **User profile management**

### Technical Highlights
- ✅ **RESTful API** design
- ✅ **MongoDB** with Mongoose ODM
- ✅ **Data validation** with Joi
- ✅ **Security** with Helmet, CORS, rate limiting
- ✅ **Responsive UI** with React & Context API
- ✅ **Axios interceptors** for token management
- ✅ **Production-ready** deployment configuration

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **Passport.js** - OAuth authentication
- **Bcrypt** - Password hashing
- **Joi** - Data validation
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **Vite** - Build tool
- **CSS3** - Styling

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Cloud database

## 📁 Project Structure

```
threadstudioss/
├── backend/
│   ├── config/
│   │   └── passport.js          # OAuth configuration
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── model/
│   │   └── index.js             # Mongoose schemas
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product CRUD routes
│   │   ├── orders.js            # Order management routes
│   │   ├── users.js             # User profile routes
│   │   └── admin.js             # Admin routes
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── utils/
│   │   └── validation.js        # Joi validation schemas
│   ├── server-new.js            # Express server
│   ├── .env                     # Environment variables
│   └── package.json
│
├── threadstudioss-react/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductsSection.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   └── CartContext.jsx   # Shopping cart state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios configuration & API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local               # Frontend environment variables
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml                  # Render deployment config
├── vercel.json                  # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd thradstudiossdeploy
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
```

Required environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/threadstudioss
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000

# OAuth (Optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

4. **Seed the database (optional)**
```bash
npm run seed
```

This creates:
- Admin user: `admin@threadstudioss.com` / `admin123`
- Customer user: `customer@example.com` / `customer123`
- 10 sample products

5. **Start the backend server**
```bash
npm start          # Production
npm run dev        # Development with nodemon
```

Server runs at: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd threadstudioss-react
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# The .env.local file is already created with default values
# For production, update VITE_API_URL to your backend URL
```

4. **Start the frontend**
```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

## 🔐 OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-api.onrender.com/api/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in details:
   - Application name: The Thread Studioss
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/refresh-token     - Refresh access token
POST   /api/auth/logout            - Logout user
GET    /api/auth/google            - Google OAuth login
GET    /api/auth/github            - GitHub OAuth login
```

### Products
```
GET    /api/products               - Get all products (with filters)
GET    /api/products/:id           - Get single product
POST   /api/products               - Create product (Admin)
PUT    /api/products/:id           - Update product (Admin)
DELETE /api/products/:id           - Delete product (Admin)
```

### Orders
```
POST   /api/orders                 - Create order
GET    /api/orders                 - Get user orders
GET    /api/orders/:id             - Get single order
POST   /api/orders/:id/cancel      - Cancel order
PUT    /api/orders/:id/status      - Update order status (Admin)
```

### Users
```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update profile
PUT    /api/users/change-password  - Change password
```

### Admin
```
GET    /api/admin/stats            - Dashboard statistics
GET    /api/admin/users            - Get all users
PUT    /api/admin/users/:id/role   - Update user role
```

## 🌐 Deployment

### Backend Deployment (Render)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Create account on [Render](https://render.com)**

3. **Create new Web Service**
   - Connect your GitHub repository
   - Name: `threadstudioss-api`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server-new.js`

4. **Add environment variables** in Render dashboard:
   - All variables from `.env.production.example`
   - Use MongoDB Atlas for database
   - Generate secure JWT secrets

5. **Deploy** - Render will automatically deploy on push

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from frontend directory**
```bash
cd threadstudioss-react
vercel
```

4. **Configure environment variables** in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

5. **Update OAuth redirect URIs** with production URLs

### Database Setup (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
5. Get connection string and add to `MONGODB_URI`

## 🧪 Testing

### Test with seed data
```bash
npm run seed
```

### API testing with curl
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🔒 Security Features

- JWT with short-lived access tokens & refresh tokens
- Password hashing with bcrypt (12 rounds)
- Helmet for security headers
- CORS configuration
- Rate limiting on API endpoints
- Input validation with Joi
- SQL injection prevention with Mongoose
- XSS protection
- OAuth 2.0 for third-party authentication

## 📊 Database Schema

### User
- name, email, password (hashed)
- role (customer/admin)
- OAuth IDs (Google, GitHub)
- address, phone
- verification status
- timestamps

### Product
- name, description, price
- category, images
- inventory, tags
- customization options
- featured status
- timestamps

### Order
- user reference
- items array with product details
- total amounts (subtotal, tax, shipping)
- status tracking
- payment information
- shipping/billing addresses
- timestamps

## 🎯 Resume Highlights

**This project demonstrates:**
- ✅ Full-stack development with MERN stack
- ✅ RESTful API design & implementation
- ✅ Authentication & Authorization (JWT + OAuth)
- ✅ Database design & management (MongoDB)
- ✅ State management (React Context API)
- ✅ Security best practices
- ✅ Production deployment
- ✅ API documentation
- ✅ Clean code architecture

## 📝 License

MIT License - feel free to use this project for your portfolio

## 👨‍💻 Author

**Your Name**
- Portfolio: [your-portfolio.com]
- LinkedIn: [linkedin.com/in/yourprofile]
- GitHub: [github.com/yourusername]

---

⭐ Star this repo if you find it helpful for your learning journey!
