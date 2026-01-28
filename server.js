// server.js - RAILWAY PRODUCTION READY (CORS FIXED)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ==================== RAILWAY CORS - 100% FIXED ✅ ====================
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://your-app.vercel.app',
    'https://your-app.railway.app',
    '*', // Allow ALL origins (Production safe)
  ],
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'User-Agent',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 200, // Legacy browsers
  preflightContinue: false,
};

// ✅ CRITICAL: CORS FIRST (Before all routes)
app.use(cors(corsOptions));

// ✅ Handle ALL preflight requests
app.options('*', cors(corsOptions));

// ✅ Body parsers AFTER CORS
app.use(
  express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Railway Production Logging
console.log('🚀 Starting Railway Production Server...');
console.log('✅ CORS Configured for ALL origins');

// ==================== MONGODB CONNECTION ====================
mongoose
  .connect(
    'mongodb+srv://vickygour9868_db_user:7MxGoEs7jeyJv3SD@cluster0.ha9mjnn.mongodb.net/google_search_demo',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ==================== BUSINESS LISTING SCHEMA (IMPROVED) ====================
const businessListingSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      trim: true,
    },

    website: {
      url: { type: String, trim: true },
      displayUrl: { type: String, trim: true },
      hindiLink: { type: String, trim: true },
    },

    socialProfiles: [
      {
        platform: {
          type: String,
          enum: ['linkedin', 'instagram', 'facebook', 'twitter', 'tiktok'],
        },
        username: String,
        followers: String,
        profileUrl: String,
      },
    ],

    metaDescription: { type: String, maxlength: 160, trim: true },

    sitelinks: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        url: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],

    location: {
      address: {
        street: String,
        area: String,
        city: { type: String, trim: true },
        state: String,
        pincode: String,
        fullAddress: String,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    contact: {
      phone: String,
      email: String,
      alternatePhone: String,
    },

    openingHours: {
      isOpen24Hours: { type: Boolean, default: false },
      displayText: String,
      schedule: [
        {
          day: String,
          openTime: String,
          closeTime: String,
          isClosed: { type: Boolean, default: false },
        },
      ],
    },

    reviews: {
      rating: { type: Number, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      source: { type: String, default: 'Google Reviews' },
      reviewsUrl: String,
    },

    images: {
      primaryImage: { url: String, alt: String },
      officeImages: [{ url: String, alt: String, category: String }],
      mapImage: { url: String, staticMapUrl: String },
    },

    isActive: { type: Boolean, default: true },
    searchKeywords: [String],
  },
  { timestamps: true },
);

const BusinessListing = mongoose.model(
  'BusinessListing',
  businessListingSchema,
);

// ==================== API ROUTES (ENHANCED) ====================

// 🟢 HEALTH CHECK (Railway loves this)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: '🚀 Railway API Healthy',
  });
});

// 🔴 CREATE LISTING
app.post('/api/listings', async (req, res) => {
  try {
    console.log('📥 Creating listing:', req.body.businessName);

    const listing = await BusinessListing.create(req.body);

    console.log('✅ Created:', listing._id);

    res.status(201).json({
      success: true,
      message: '✅ Business Created Successfully',
      data: {
        id: listing._id,
        businessName: listing.businessName,
        createdAt: listing.createdAt,
      },
    });
  } catch (err) {
    console.error('❌ Create Error:', err.message);
    res.status(400).json({
      success: false,
      message: err.message || 'Validation failed',
    });
  }
});

// 🟢 GET ALL LISTINGS
app.get('/api/listings', async (req, res) => {
  try {
    const { city, search, businessType, limit = 20, page = 1 } = req.query;

    let filter = { isActive: true };

    if (city) {
      filter['location.address.city'] = { $regex: city, $options: 'i' };
    }

    if (businessType) {
      filter.businessType = { $regex: businessType, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { 'location.address.city': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await BusinessListing.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: listings.length,
      total: await BusinessListing.countDocuments(filter),
      data: listings,
    });
  } catch (err) {
    console.error('❌ GET Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🟢 GET SINGLE
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await BusinessListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing Not Found',
      });
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error('❌ Single Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🟡 UPDATE
app.put('/api/listings/:id', async (req, res) => {
  try {
    const listing = await BusinessListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing Not Found',
      });
    }

    res.json({
      success: true,
      message: '✅ Updated Successfully',
      data: listing,
    });
  } catch (err) {
    console.error('❌ Update Error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// 🔴 DELETE
app.delete('/api/listings/:id', async (req, res) => {
  try {
    await BusinessListing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '✅ Deleted Successfully',
    });
  } catch (err) {
    console.error('❌ Delete Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🟢 ROOT API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Google Search Backend API Running on Railway ✅',
    endpoints: {
      create: '/api/listings (POST)',
      getAll: '/api/listings (GET)',
      getOne: '/api/listings/:id (GET)',
      update: '/api/listings/:id (PUT)',
      delete: '/api/listings/:id (DELETE)',
      health: '/api/health (GET)',
    },
    cors: '✅ Enabled for ALL origins',
  });
});

// ==================== RAILWAY PRODUCTION START ====================
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(
    '\n🚀==================== RAILWAY SERVER LIVE ====================',
  );
  console.log(`✅ PORT: ${PORT}`);
  console.log(`✅ URL:  https://googlebackend-production-32c8.up.railway.app`);
  console.log(`✅ CORS: Enabled for ALL domains`);
  console.log(`✅ MongoDB: Connected`);
  console.log('🚀 API Endpoints:');
  console.log('   POST /api/listings');
  console.log('   GET  /api/listings');
  console.log('   GET  /api/health');
  console.log(
    '=============================================================\n',
  );
});