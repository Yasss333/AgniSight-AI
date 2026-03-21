const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createChallan,
  getChallan,
  listChallans,
  updateChallan,
  deleteChallan,
  exportChallanJSON,
} = require('../controllers/challanController');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * POST /api/challan
 * Create a new challan entry
 */
router.post('/', createChallan);

/**
 * GET /api/challan
 * List all challans for current user (with pagination)
 */
router.get('/', listChallans);

/**
 * GET /api/challan/:id
 * Get a specific challan by ID
 */
router.get('/:id', getChallan);

/**
 * GET /api/challan/:id/export
 * Export challan as structured JSON
 */
router.get('/:id/export', exportChallanJSON);

/**
 * PUT /api/challan/:id
 * Update a challan
 */
router.put('/:id', updateChallan);

/**
 * DELETE /api/challan/:id
 * Delete a challan
 */
router.delete('/:id', deleteChallan);

module.exports = router;
