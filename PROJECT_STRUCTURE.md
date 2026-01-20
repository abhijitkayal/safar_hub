# SafarHub - Travel Booking Platform

## 🎯 Project Overview
A comprehensive travel booking platform built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS. The platform supports booking for stays, tours, adventures, and vehicle rentals.

---

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23.24
- **Maps**: Leaflet + React Leaflet
- **Rich Text**: React Quill
- **Carousel**: Swiper 12
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons, Heroicons
- **Notifications**: React Hot Toast

### Backend
- **Database**: MongoDB 7.0.0
- **ODM**: Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt/bcryptjs
- **Email**: Nodemailer 7.0.10
- **File Upload**: Cloudinary 2.8.0
- **OTP Generation**: otp-generator

---

## 📁 Project Structure

```
travels/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Navbar & Footer
│   ├── page.tsx                 # Homepage (with dbConnect)
│   ├── globals.css              # Global styles
│   ├── loading.tsx              # Loading state
│   │
│   ├── about-us/                # About page
│   ├── contact-us/              # Contact page
│   ├── privacy-policy/          # Privacy policy
│   ├── refund-policy/           # Refund policy
│   ├── terms-conditions/        # Terms & conditions
│   │
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── forgot-password/         # Password recovery
│   ├── reset-password/          # Password reset
│   ├── verify-email/            # Email verification
│   │
│   ├── profile/                 # User profile
│   ├── bookings/                # User bookings
│   ├── wishlist/                # Wishlist
│   ├── inbox/                   # User inbox
│   ├── checkout/                # Checkout page
│   │
│   ├── stays/                   # Hotel/Stay listings & booking
│   ├── tours/                   # Tour packages
│   ├── adventures/              # Adventure activities
│   ├── vehicle-rental/          # Vehicle rentals
│   ├── blogs/                   # Blog system
│   ├── products/                # E-commerce products
│   ├── services/                # Services
│   │
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx          # Admin layout
│   │   ├── page.tsx            # Admin home
│   │   ├── categories/         # Category management
│   │   ├── stays/              # Stay management
│   │   ├── tours/              # Tour management
│   │   ├── adventures/         # Adventure management
│   │   ├── vehicle-rental/     # Vehicle management
│   │   ├── products/           # Product management
│   │   ├── blogs/              # Blog management
│   │   ├── bookings/           # Booking management
│   │   ├── orders/             # Order management
│   │   ├── customers/          # Customer management
│   │   ├── reviews/            # Review management
│   │   ├── coupons/            # Coupon management
│   │   ├── add-coupons/        # Add coupons
│   │   ├── invoices/           # Invoice management
│   │   ├── add-invoices/       # Add invoices
│   │   ├── support/            # Support tickets
│   │   ├── transactions/       # Transaction history
│   │   ├── partners/           # Partner management
│   │   ├── sellers/            # Seller management
│   │   ├── profile/            # Admin profile
│   │   ├── cancellation/       # Cancellation management
│   │   └── product-purchase-manage/ # Purchase management
│   │
│   ├── vendor/                  # Vendor portal
│   ├── safar-partner/           # Partner portal
│   │
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   │   ├── login/          # POST /api/auth/login
│   │   │   ├── signup/         # POST /api/auth/signup
│   │   │   ├── send-otp/       # POST /api/auth/send-otp
│   │   │   ├── verify-otp/     # POST /api/auth/verify-otp
│   │   │   ├── forgot-password/ # POST /api/auth/forgot-password
│   │   │   ├── reset-password/ # POST /api/auth/reset-password
│   │   │   ├── change-password/ # PUT /api/auth/change-password
│   │   │   └── verify/         # GET /api/auth/verify
│   │   │
│   │   ├── profile/            # User profile endpoints
│   │   ├── addresses/          # User addresses
│   │   ├── bookings/           # Booking management
│   │   ├── orders/             # Order management
│   │   ├── cart/               # Shopping cart
│   │   ├── reviews/            # Review system
│   │   │
│   │   ├── stays/              # Stay listings & CRUD
│   │   ├── tours/              # Tour listings & CRUD
│   │   ├── adventures/         # Adventure listings & CRUD
│   │   ├── vehicle-rentals/    # Vehicle listings & CRUD
│   │   ├── products/           # Product listings & CRUD
│   │   ├── blogs/              # Blog endpoints
│   │   │
│   │   ├── categories/         # Category management
│   │   ├── coupons/            # Coupon management
│   │   ├── invoices/           # Invoice management
│   │   ├── payments/           # Payment processing
│   │   ├── availability/       # Availability checking
│   │   │
│   │   ├── contact/            # Contact form
│   │   ├── newsletter/         # Newsletter subscription
│   │   ├── support/            # Support tickets
│   │   ├── hero/               # Hero section management
│   │   ├── uploads/            # File upload (Cloudinary)
│   │   ├── logout/             # Logout endpoint
│   │   ├── vendor/             # Vendor endpoints
│   │   └── admin/              # Admin endpoints
│   │
│   ├── components/              # React components
│   │   ├── Pages/              # Page-specific components
│   │   │   ├── hf/             # Header/Footer (Navbar, Footer)
│   │   │   └── home/           # Homepage components
│   │   ├── common/             # Shared components
│   │   ├── bookings/           # Booking components
│   │   ├── orders/             # Order components
│   │   └── Reviews/            # Review components
│   │
│   └── hooks/                   # Custom React hooks
│       ├── useCart.ts          # Cart management hook
│       └── useAvailability.ts  # Availability checking hook
│
├── models/                      # Mongoose Models (MongoDB Schemas)
│   ├── User.ts                 # User model (email, password, role, etc.)
│   ├── Profile.ts              # User profile details
│   ├── UserAddress.ts          # User addresses
│   ├── OTP.ts                  # OTP verification (with email sending)
│   │
│   ├── Category.ts             # Categories (stays, tours, etc.)
│   ├── Stay.ts                 # Hotel/Stay listings
│   ├── Tour.ts                 # Tour packages
│   ├── Adventure.ts            # Adventure activities
│   ├── VehicleRental.ts        # Vehicle rentals
│   ├── Product.ts              # E-commerce products
│   ├── Blog.ts                 # Blog posts
│   │
│   ├── Booking.ts              # Bookings
│   ├── Order.ts                # Orders
│   ├── CartItem.ts             # Shopping cart items
│   ├── Review.ts               # Reviews & ratings
│   ├── Coupon.ts               # Discount coupons
│   ├── Invoice.ts              # Invoices
│   ├── Transaction.ts          # Payment transactions
│   ├── Settlement.ts           # Vendor settlements
│   │
│   ├── Contact.ts              # Contact form submissions
│   ├── Support.ts              # Support tickets
│   ├── HeroSection.ts          # Homepage hero section
│   └── AdminMeta.ts            # Admin metadata
│
├── lib/                         # Utility libraries
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # MongoDB connection (dbConnect)
│   │   └── cloudinary.ts       # Cloudinary config
│   │
│   ├── db/                     # Database utilities
│   │   ├── initCollections.ts # Initialize MongoDB collections
│   │   └── ensureWishlistIndexes.ts # Wishlist indexes
│   │
│   ├── middlewares/            # Middleware functions
│   │   ├── auth.ts            # JWT authentication middleware
│   │   └── asyncHandler.ts    # Async error handler
│   │
│   ├── utils/                  # Utility functions
│   │   ├── mailSender.ts      # Email sending (Nodemailer)
│   │   └── imageUploader.ts   # Cloudinary image upload
│   │
│   └── mail/                   # Email templates
│       └── templates/          # Email HTML templates
│
├── public/                      # Static assets
│   ├── hero/                   # Hero images
│   ├── categories/             # Category images
│   ├── gallery/                # Gallery images
│   ├── aboutpage/              # About page images
│   ├── activity/               # Activity images
│   ├── nav/                    # Navigation images
│   ├── footer/                 # Footer images
│   ├── home/                   # Homepage images
│   ├── journey/                # Journey images
│   ├── offers/                 # Offer images
│   ├── popular/                # Popular destination images
│   ├── stats/                  # Stats images
│   ├── Testimonial/            # Testimonial images
│   └── oppertunity/            # Opportunity images
│
├── assets/                      # Additional assets
├── scripts/                     # Utility scripts
│   ├── checkIndexes.js         # Database index checker
│   └── cleanupWishlist.js      # Wishlist cleanup script
│
├── .env.local                   # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.ts               # Next.js config
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.mjs           # PostCSS config
├── eslint.config.mjs            # ESLint config
└── README.md                    # Project README

```

---

## 🔧 Environment Variables

Create `.env.local` in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# JWT Secret
JWT_SECRET=your-secret-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🗄️ Database Models (MongoDB/Mongoose)

### User Management
- **User**: Authentication, roles (customer/vendor/admin)
- **Profile**: User profile details
- **UserAddress**: Multiple addresses per user
- **OTP**: One-time passwords for verification

### Listings
- **Stay**: Hotels, homestays, BnBs
- **Tour**: Tour packages
- **Adventure**: Trekking, hiking, rafting, etc.
- **VehicleRental**: Cars, bikes
- **Product**: E-commerce products
- **Category**: Categorization for all listings

### Transactions
- **Booking**: All booking records
- **Order**: Product orders
- **CartItem**: Shopping cart
- **Transaction**: Payment records
- **Settlement**: Vendor payouts
- **Invoice**: Invoice generation

### Content & Support
- **Blog**: Blog posts
- **Review**: Reviews & ratings
- **Contact**: Contact form submissions
- **Support**: Support tickets
- **HeroSection**: Homepage hero content
- **Coupon**: Discount coupons

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Server runs on: `http://localhost:3000`

### Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Authentication Flow

1. **Signup**: 
   - User enters email → OTP sent via email
   - User enters OTP → Account created
   - Route: `/signup` → `POST /api/auth/send-otp` → `POST /api/auth/signup`

2. **Login**:
   - Email + Password → JWT token issued
   - Route: `/login` → `POST /api/auth/login`

3. **Password Reset**:
   - Forgot password → Email verification → Reset password
   - Routes: `/forgot-password` → `/reset-password`

4. **Protected Routes**:
   - Use `auth` middleware from `lib/middlewares/auth.ts`
   - Verifies JWT token from cookies/headers

---

## 📡 API Endpoints

### Authentication (`/api/auth/*`)
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token

### User Profile
- `GET/PUT /api/profile` - Get/update user profile
- `GET/POST /api/addresses` - Manage addresses

### Listings
- `GET/POST /api/stays` - Stays
- `GET/POST /api/tours` - Tours
- `GET/POST /api/adventures` - Adventures
- `GET/POST /api/vehicle-rentals` - Vehicle rentals
- `GET/POST /api/products` - Products
- `GET/POST /api/blogs` - Blogs

### Bookings & Orders
- `GET/POST /api/bookings` - Manage bookings
- `GET/POST /api/orders` - Manage orders
- `GET/POST/DELETE /api/cart` - Shopping cart

### Reviews & Support
- `GET/POST /api/reviews` - Reviews
- `POST /api/contact` - Contact form
- `GET/POST /api/support` - Support tickets

### Admin
- Various admin endpoints under `/api/admin/*`

---

## 🎨 Key Features

### Frontend Features
- ✅ Server-side rendering (SSR)
- ✅ Responsive design (Tailwind CSS)
- ✅ Interactive maps (Leaflet)
- ✅ Rich text editor (React Quill)
- ✅ Image carousel (Swiper)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Form validation
- ✅ Date picker for bookings

### Backend Features
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication
- ✅ Email notifications (OTP, confirmations)
- ✅ File upload to Cloudinary
- ✅ Role-based access control (Customer/Vendor/Admin)
- ✅ Shopping cart system
- ✅ Booking system with availability checking
- ✅ Review & rating system
- ✅ Coupon/discount system
- ✅ Invoice generation
- ✅ Payment transaction tracking

---

## 🛠️ Common Issues & Solutions

### Issue 1: MongoDB Connection Not Showing
**Problem**: "MongoDB connected" message not appearing in console

**Solution**:
1. Visit the homepage `/` (not `/signup` or other pages)
2. Check terminal/console (not browser console)
3. Ensure `MONGODB_URI` is set in `.env.local`

### Issue 2: OTP Email Not Sending
**Problem**: 500 error when sending OTP

**Solution**:
1. Set `EMAIL_USER` and `EMAIL_PASS` in `.env.local`
2. Use Gmail App Password (not regular password)
3. Check terminal for `🔐 DEV MODE - OTP` message (OTP logged in dev mode)

### Issue 3: Collections Not Created
**Problem**: MongoDB database empty

**Solution**:
- Visit homepage `/` to trigger `initCollections()`
- Collections are created automatically on first connection

### Issue 4: Port Already in Use
**Problem**: `Port 3000 is in use`

**Solution**:
```bash
# Kill existing Node processes
Get-Process | Where-Object { $_.ProcessName -like '*node*' } | Stop-Process -Force
# Remove lock file
Remove-Item -Path ".next\dev\lock" -Force
# Restart
npm run dev
```

---

## 📝 Important Files

### Database
- `lib/config/database.ts` - MongoDB connection handler
- `lib/db/initCollections.ts` - Initialize all collections

### Authentication
- `lib/middlewares/auth.ts` - JWT authentication middleware
- `app/api/auth/*/route.ts` - Auth API endpoints

### Email
- `lib/utils/mailSender.ts` - Email sending utility
- `lib/mail/templates/` - Email templates

### File Upload
- `lib/utils/imageUploader.ts` - Cloudinary upload
- `lib/config/cloudinary.ts` - Cloudinary configuration

---

## 👥 User Roles

1. **Customer**: Regular users who book stays/tours/adventures
2. **Vendor**: Service providers who list their offerings
3. **Admin**: Platform administrators with full access

---

## 🔄 Workflow Example: Booking a Stay

1. User browses `/stays`
2. Clicks on a stay → `/stays/[id]`
3. Checks availability → `POST /api/availability`
4. Books → `/stays/[id]/book`
5. Payment → `POST /api/payments`
6. Booking created → `POST /api/bookings`
7. Confirmation email sent
8. View booking → `/bookings`

---

## 📞 Support

For any issues, create a support ticket at `/support` or contact via `/contact-us`.

---

## 📄 License

Private project - All rights reserved.

---

## 🎯 Development Tips for AI Assistants

When troubleshooting or adding features, always mention:
1. **Relevant file paths** from this structure
2. **API endpoint** being used
3. **Error messages** from terminal (server-side) or browser console (client-side)
4. **Environment variables** needed
5. **Database models** involved

Example prompt:
```
I'm getting a 500 error when calling POST /api/auth/send-otp.
Looking at models/OTP.ts and lib/utils/mailSender.ts.
Error in terminal: "Error: Missing credentials for PLAIN"
Environment: EMAIL_USER and EMAIL_PASS are not set in .env.local
```

This helps AI assistants quickly identify and fix issues!
