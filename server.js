// server.js - IP ENABLED VERSION (Production Ready)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== MONGODB CONNECTION ====================
mongoose
  .connect(
    'mongodb+srv://vickygour9868_db_user:7MxGoEs7jeyJv3SD@cluster0.ha9mjnn.mongodb.net/google_search_demo',
  )
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ==================== BUSINESS LISTING SCHEMA ====================
const businessListingSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    businessType: { type: String, required: true, trim: true },

    website: {
      url: String,
      displayUrl: String,
      hindiLink: String,
    },

    socialProfiles: [
      {
        platform: {
          type: String,
          enum: ['linkedin', 'instagram', 'facebook', 'twitter'],
        },
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
        order: { type: Number, default: 0 },
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
      totalReviews: Number,
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

// ==================== API ROUTES ====================

// CREATE
app.post('/api/listings', async (req, res) => {
  try {
    const listing = await BusinessListing.create(req.body);
    res.status(201).json({
      success: true,
      message: '✅ Business Created Successfully',
      data: listing,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// READ ALL
app.get('/api/listings', async (req, res) => {
  try {
    const { city, search, businessType } = req.query;

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

    const listings = await BusinessListing.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// READ SINGLE
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE
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
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE
app.delete('/api/listings/:id', async (req, res) => {
  try {
    await BusinessListing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '✅ Deleted Successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ROOT API
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Google Search Backend API Running',
  });
});

// ==================== START SERVER (IP ENABLED) ====================

const PORT = 5000;
const HOST = '0.0.0.0'; // IMPORTANT

app.listen(PORT, HOST, () => {
  console.log('\n✅ SERVER STARTED SUCCESSFULLY');
  console.log(`👉 Local:   http://localhost:${PORT}`);
  console.log(`👉 Network: http://192.168.1.3:${PORT}`);
});
