# 🧪 Testing Checklist

Use this checklist to test all features before deploying to production.

## ✅ Pre-Deployment Testing

### Setup & Configuration
- [ ] Backend `.env` file configured with all required variables
- [ ] Frontend `.env.local` file configured with API URL
- [ ] MongoDB connection successful
- [ ] All npm packages installed (backend & frontend)
- [ ] Both servers start without errors

### Authentication Tests

#### Registration
- [ ] Register with email/password works
- [ ] Password validation works (min 6 characters)
- [ ] Email validation works
- [ ] Duplicate email registration shows error
- [ ] User data saved to database correctly

#### Login
- [ ] Login with valid credentials works
- [ ] Invalid credentials show error message
- [ ] JWT token stored in localStorage
- [ ] Navbar updates after login (shows profile/cart/logout)
- [ ] Protected routes accessible after login

#### OAuth (Optional - if configured)
- [ ] Google login button redirects correctly
- [ ] Google OAuth callback works
- [ ] GitHub login button redirects correctly
- [ ] GitHub OAuth callback works
- [ ] OAuth user data saved correctly
- [ ] Avatar from OAuth provider displayed

#### Token Management
- [ ] Access token expires after 15 minutes
- [ ] Refresh token automatically refreshes access token
- [ ] API calls work after token refresh
- [ ] Logout clears tokens from storage
- [ ] Logout redirects to home/login page

### Product Features

#### Product Listing
- [ ] Products page displays all products
- [ ] Product images load correctly
- [ ] Product prices display correctly
- [ ] Product descriptions show
- [ ] "Out of Stock" badge shows for zero stock

#### Product Details
- [ ] Product detail page loads from URL
- [ ] All product information displays
- [ ] Image gallery works (if multiple images)
- [ ] Quantity selector works (+/- buttons)
- [ ] Add to Cart button works
- [ ] Buy Now redirects to cart
- [ ] Stock limit prevents over-ordering

### Shopping Cart

#### Cart Operations
- [ ] Add product to cart works
- [ ] Cart count badge updates in navbar
- [ ] Cart page shows all added products
- [ ] Product images in cart display
- [ ] Quantity can be updated in cart
- [ ] Remove from cart works
- [ ] Cart total calculates correctly
- [ ] Free shipping threshold message shows
- [ ] Cart persists after page refresh (localStorage)

#### Cart Edge Cases
- [ ] Empty cart shows appropriate message
- [ ] Adding same product updates quantity
- [ ] Quantity cannot go below 1
- [ ] Cart total updates on quantity change

### Checkout & Orders

#### Checkout Flow
- [ ] Proceed to Checkout requires authentication
- [ ] Shipping address form displays
- [ ] All address fields validate correctly
- [ ] Phone number validates (10 digits)
- [ ] ZIP code validates (6 digits)
- [ ] Order summary shows correct totals
- [ ] Place Order creates order in database

#### Order Management
- [ ] Orders page shows user's orders
- [ ] Order number displays correctly
- [ ] Order items show with correct quantities
- [ ] Shipping address displays correctly
- [ ] Order status displays
- [ ] Order total is correct
- [ ] Empty orders page shows message

### User Profile

#### Profile Display
- [ ] Profile page shows user information
- [ ] Avatar displays (OAuth users)
- [ ] OAuth badge shows for OAuth users
- [ ] Email displays correctly
- [ ] Role badge displays
- [ ] Address displays if saved

#### Profile Edit
- [ ] Edit Profile button enables form
- [ ] Name can be updated
- [ ] Phone can be updated
- [ ] Address fields can be updated
- [ ] Save Changes updates database
- [ ] Success message shows after save
- [ ] Cancel button reverts changes
- [ ] Profile updates reflect immediately

### Navigation & UI

#### Navbar
- [ ] Logo/brand name displays
- [ ] All navigation links work
- [ ] Cart count badge shows correct number
- [ ] Login/Signup buttons show when logged out
- [ ] Profile/Orders/Logout show when logged in
- [ ] Mobile menu works (if responsive)

#### Responsive Design
- [ ] Desktop layout looks good (>1024px)
- [ ] Tablet layout looks good (768-1024px)
- [ ] Mobile layout looks good (<768px)
- [ ] All buttons are clickable on mobile
- [ ] Forms are usable on mobile

### Error Handling

#### API Errors
- [ ] Network errors show user-friendly messages
- [ ] 401 errors trigger logout
- [ ] 403 errors show permission denied
- [ ] 404 errors show not found message
- [ ] 500 errors show server error message

#### Form Validation
- [ ] Required fields show validation errors
- [ ] Email format validated
- [ ] Password requirements enforced
- [ ] Phone number format validated
- [ ] ZIP code format validated

### Security Tests

#### Authentication Security
- [ ] Cannot access protected routes without login
- [ ] Token expiration handled correctly
- [ ] Logout clears all auth data
- [ ] Password not visible in network requests
- [ ] JWT token in Authorization header (not URL)

#### Authorization
- [ ] Admin routes require admin role
- [ ] Users cannot access other users' orders
- [ ] Users cannot modify other users' profiles
- [ ] Product creation requires admin role

### Performance

#### Load Times
- [ ] Homepage loads quickly
- [ ] Product images lazy load (if implemented)
- [ ] API responses under 500ms
- [ ] No memory leaks in React components
- [ ] No console errors in browser

#### Database
- [ ] Products have indexes on commonly queried fields
- [ ] User lookups by email are fast
- [ ] Order queries by user are efficient

### Admin Features (Optional)

#### Product Management
- [ ] Admin can create products
- [ ] Admin can edit products
- [ ] Admin can delete products
- [ ] Admin can update inventory

#### Order Management
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can add tracking numbers

#### User Management
- [ ] Admin can view all users
- [ ] Admin can update user roles
- [ ] Admin dashboard shows statistics

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:** Check MONGODB_URI in .env, ensure MongoDB is running

### Issue: CORS Error
**Solution:** Verify CLIENT_URL in backend .env matches frontend URL

### Issue: OAuth Redirect Error
**Solution:** Check OAuth callback URLs in Google/GitHub settings

### Issue: Token Not Refreshing
**Solution:** Check refresh token endpoint, verify JWT_REFRESH_SECRET

### Issue: Cart Not Persisting
**Solution:** Check browser localStorage, ensure domain is correct

### Issue: Images Not Loading
**Solution:** Check image URLs, ensure CORS allows image domain

### Issue: Port Already in Use
**Solution:** Kill process on port 5000: `npx kill-port 5000`

## 📊 Test Data Setup

### Create Test Products
```javascript
// MongoDB Shell or Compass
db.products.insertMany([
  {
    name: "Crochet Tote Bag",
    description: "Handmade cotton tote bag",
    price: 899,
    category: "bags",
    stock: 10,
    images: ["https://example.com/bag.jpg"]
  },
  {
    name: "Crochet Coasters Set",
    description: "Set of 4 colorful coasters",
    price: 299,
    category: "home-decor",
    stock: 20,
    images: ["https://example.com/coasters.jpg"]
  }
]);
```

### Create Admin User
```javascript
// Register normally, then in MongoDB:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

## ✨ Before Deploying

### Code Quality
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks
- [ ] All TODO comments addressed
- [ ] No API keys hardcoded

### Documentation
- [ ] README.md is complete and accurate
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment steps clear

### Git
- [ ] All changes committed
- [ ] .gitignore includes .env files
- [ ] Repository is public (for resume)
- [ ] README has screenshots (optional)

### Environment Variables
- [ ] Production .env files ready
- [ ] No development URLs in production
- [ ] Strong JWT secrets generated
- [ ] MongoDB Atlas connection string ready

## 🚀 Deployment Testing

### After Backend Deployment (Render)
- [ ] Health check endpoint responds
- [ ] Database connected successfully
- [ ] Environment variables loaded
- [ ] API endpoints accessible
- [ ] OAuth callbacks work with production URL

### After Frontend Deployment (Vercel)
- [ ] Site loads without errors
- [ ] API calls reach backend
- [ ] Authentication flow works
- [ ] OAuth redirects work
- [ ] All pages accessible

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] CORS configured correctly
- [ ] Cookies work across domains
- [ ] Token refresh works in production
- [ ] All features work end-to-end

## 📈 Post-Deployment

### Monitoring
- [ ] Check Render logs for errors
- [ ] Check Vercel logs for errors
- [ ] Monitor MongoDB Atlas metrics
- [ ] Test from different devices
- [ ] Test from different browsers

### Performance
- [ ] Lighthouse score check
- [ ] Mobile performance test
- [ ] API response time check
- [ ] Database query optimization

## ✅ Final Checklist

- [ ] All tests passed
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Deployed successfully
- [ ] Tested in production
- [ ] GitHub repository updated
- [ ] Project added to resume
- [ ] Demo video created (optional)

---

**Good luck with your deployment! 🚀**
