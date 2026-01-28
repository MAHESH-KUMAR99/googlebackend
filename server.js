// server.js — EXPRESS 5 + RAILWAY PRODUCTION READY ✅

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* ===================== CORS (EXPRESS 5 SAFE) ===================== */
app.use(
  cors({
    origin: '*', // allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* ===================== BODY PARSERS ===================== */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

console.log('🚀 Starting Server...');

/* ===================== MONGODB CONNECTION ===================== */
mongoose
  .connect(
    'mongodb+srv://vickygour9868_db_user:7MxGoEs7jeyJv3SD@cluster0.ha9mjnn.mongodb.net/google_search_demo'
  )
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

console.log('✅ MongoDB Connected Successfully');

/* ===================== SCHEMA ===================== */
const businessListingSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    businessType: { type: String, required: true },

    website: {
      url: String,
      displayUrl: String,
      hindiLink: String,
    },

    socialProfiles: [
      {
        platform: String,
        username: String,
        followers: String,
        profileUrl: String,
      },
    ],

    metaDescription: { type: String, maxlength: 160 },

    sitelinks: [
      {
        title: String,
        description: String,
        url: String,
        order: Number,
      },
    ],

    location: {
      address: {
        street: String,
        area: String,
        city: String,
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
      isOpen24Hours: Boolean,
      displayText: String,
    },

    reviews: {
      rating: { type: Number, min: 0, max: 5 },
      totalReviews: Number,
      source: String,
    },

    images: {
      primaryImage: { url: String, alt: String },
      officeImages: [{ url: String, alt: String }],
    },

    isActive: { type: Boolean, default: true },
    searchKeywords: [String],
  },
  { timestamps: true }
);

const BusinessListing = mongoose.model(
  'BusinessListing',
  businessListingSchema
);

/* ===================== ROUTES ===================== */

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API Healthy',
    time: new Date().toISOString(),
  });
});

// CREATE
app.post('/api/listings', async (req, res) => {
  try {
    const listing = await BusinessListing.create(req.body);
    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET ALL
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await BusinessListing.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET ONE
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await BusinessListing.findById(req.params.id);
    if (!listing) {
      return res
        .status(404)
        .json({ success: false, message: 'Not Found' });
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE
app.put('/api/listings/:id', async (req, res) => {
  try {
    const listing = await BusinessListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE
app.delete('/api/listings/:id', async (req, res) => {
  try {
    await BusinessListing.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ROOT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Google Search Backend API Running',
  });
});

/* ===================== START SERVER ===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log(`✅ Server running on PORT ${PORT}`);
  console.log('=================================');
});
