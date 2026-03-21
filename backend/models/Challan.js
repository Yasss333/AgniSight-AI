const mongoose = require('mongoose');

const ChallanSchema = new mongoose.Schema(
  {
    // ═══════════════════════════════════════════════════════════════════════════════
    // HEADER SECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    challanNo: {
      type: String,
      required: [true, 'Challan number is required'],
      unique: true,
      trim: true,
    },
    customerDetail: {
      type: String,
      trim: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // CUSTOMER INFORMATION SECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    mS: {
      type: String,
      trim: true,
      description: 'M/S - Company/Merchant Name',
    },
    transporterId: {
      type: String,
      trim: true,
    },
    courierPartner: {
      type: String,
      trim: true,
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // SHIPMENT DETAILS SECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    pickupDate: {
      type: Date,
    },
    lotNo: {
      type: String,
      trim: true,
    },
    numberOfBoxes: {
      type: Number,
      min: 0,
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRODUCT TABLE SECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    products: [
      {
        srNo: {
          type: Number,
          required: true,
        },
        nameOfProduct: {
          type: String,
          required: [true, 'Product name is required'],
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [0, 'Quantity cannot be negative'],
        },
        _id: false, // Disable _id for subdocuments
      },
    ],

    // ═══════════════════════════════════════════════════════════════════════════════
    // SUMMARY SECTION
    // ═══════════════════════════════════════════════════════════════════════════════
    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // META FIELDS
    // ═══════════════════════════════════════════════════════════════════════════════
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      description: 'Reference to the warehouse session this challan belongs to',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      description: 'User who created this challan entry',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ═══════════════════════════════════════════════════════════════════════════════
// VIRTUAL FIELD: Calculate total quantity from products array
// ═══════════════════════════════════════════════════════════════════════════════
ChallanSchema.virtual('calculatedTotal').get(function () {
  return this.products.reduce((sum, product) => sum + (product.quantity || 0), 0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: Auto-update totalQuantity before saving
// ═══════════════════════════════════════════════════════════════════════════════
ChallanSchema.pre('save', function (next) {
  if (this.products && Array.isArray(this.products)) {
    this.totalQuantity = this.products.reduce((sum, product) => sum + (product.quantity || 0), 0);
  }
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════
ChallanSchema.index({ challanNo: 1 });
ChallanSchema.index({ sessionId: 1 });
ChallanSchema.index({ createdBy: 1 });
ChallanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Challan', ChallanSchema);
