const Challan = require('../models/Challan');
const logger = require('../utils/logger');
const { createChallanSchema, updateChallanSchema } = require('../validation/challanValidation');

// ═══════════════════════════════════════════════════════════════════════════════
// @route  POST /api/challan
// @desc   Create a new challan entry
// @access Private (Operator+)
// ═══════════════════════════════════════════════════════════════════════════════
const createChallan = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = createChallanSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    const { challanNo, mS, transporterId, courierPartner, pickupDate, lotNo, numberOfBoxes, products, notes } = value;

    // Check for duplicate challan number
    const existingChallan = await Challan.findOne({ challanNo });
    if (existingChallan) {
      return res.status(400).json({
        success: false,
        message: 'Challan number already exists',
      });
    }

    const challan = await Challan.create({
      challanNo,
      mS,
      transporterId,
      courierPartner,
      pickupDate: pickupDate ? new Date(pickupDate) : undefined,
      lotNo,
      numberOfBoxes,
      products: products || [],
      notes,
      createdBy: req.user._id,
    });

    logger.info(`Challan created: ${challanNo}`);

    res.status(201).json({
      success: true,
      message: 'Challan created successfully',
      challan,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @route  GET /api/challan/:id
// @desc   Get a specific challan by ID
// @access Private
// ═══════════════════════════════════════════════════════════════════════════════
const getChallan = async (req, res, next) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('createdBy', 'name email');

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: 'Challan not found',
      });
    }

    res.status(200).json({
      success: true,
      challan,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @route  GET /api/challan
// @desc   List all challans for current user
// @access Private
// ═══════════════════════════════════════════════════════════════════════════════
const listChallans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Challan.countDocuments({ createdBy: req.user._id });
    const challans = await Challan.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      challans,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @route  PUT /api/challan/:id
// @desc   Update a challan
// @access Private
// ═══════════════════════════════════════════════════════════════════════════════
const updateChallan = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = updateChallanSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    const { mS, transporterId, courierPartner, pickupDate, lotNo, numberOfBoxes, products, status, notes } = value;

    let challan = await Challan.findById(req.params.id);

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: 'Challan not found',
      });
    }

    // Check authorization
    if (challan.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this challan',
      });
    }

    // Update fields
    if (mS) challan.mS = mS;
    if (transporterId) challan.transporterId = transporterId;
    if (courierPartner) challan.courierPartner = courierPartner;
    if (pickupDate) challan.pickupDate = new Date(pickupDate);
    if (lotNo) challan.lotNo = lotNo;
    if (numberOfBoxes) challan.numberOfBoxes = numberOfBoxes;
    if (products) challan.products = products;
    if (status) challan.status = status;
    if (notes) challan.notes = notes;

    challan = await challan.save();

    logger.info(`Challan updated: ${challan.challanNo}`);

    res.status(200).json({
      success: true,
      message: 'Challan updated successfully',
      challan,
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @route  DELETE /api/challan/:id
// @desc   Delete a challan
// @access Private
// ═══════════════════════════════════════════════════════════════════════════════
const deleteChallan = async (req, res, next) => {
  try {
    const challan = await Challan.findById(req.params.id);

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: 'Challan not found',
      });
    }

    // Check authorization
    if (challan.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this challan',
      });
    }

    await Challan.findByIdAndDelete(req.params.id);

    logger.info(`Challan deleted: ${challan.challanNo}`);

    res.status(200).json({
      success: true,
      message: 'Challan deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @route  GET /api/challan/:id/export
// @desc   Export challan as structured JSON
// @access Private
// ═══════════════════════════════════════════════════════════════════════════════
const exportChallanJSON = async (req, res, next) => {
  try {
    const challan = await Challan.findById(req.params.id).populate('createdBy', 'name email');

    if (!challan) {
      return res.status(404).json({
        success: false,
        message: 'Challan not found',
      });
    }

    // Structured JSON output
    const structuredData = {
      header: {
        challanNo: challan.challanNo,
        customerDetail: challan.customerDetail,
      },
      customerInformation: {
        businessName: challan.mS,
        transporterId: challan.transporterId,
        courierPartner: challan.courierPartner,
      },
      shipmentDetails: {
        pickupDate: challan.pickupDate ? challan.pickupDate.toISOString().split('T')[0] : null,
        lotNo: challan.lotNo,
        numberOfBoxes: challan.numberOfBoxes,
      },
      productTable: challan.products.map((product) => ({
        srNo: product.srNo,
        nameOfProduct: product.nameOfProduct,
        quantity: product.quantity,
      })),
      summary: {
        totalQuantity: challan.totalQuantity,
      },
      metadata: {
        status: challan.status,
        createdBy: {
          name: challan.createdBy?.name,
          email: challan.createdBy?.email,
        },
        createdAt: challan.createdAt,
        updatedAt: challan.updatedAt,
        notes: challan.notes,
      },
    };

    res.status(200).json({
      success: true,
      data: structuredData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChallan,
  getChallan,
  listChallans,
  updateChallan,
  deleteChallan,
  exportChallanJSON,
};
