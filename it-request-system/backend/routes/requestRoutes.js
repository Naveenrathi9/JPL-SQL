const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// Debug imports
console.log('Controller functions:', {
  submitRequest: typeof requestController.submitRequest,
  handleApproval: typeof requestController.handleApproval,
  getAllRequests: typeof requestController.getAllRequests,
  updateRequestStatus: typeof requestController.updateRequestStatus
});

router.post('/submit', authMiddleware, requestController.submitRequest);
router.get('/approve', requestController.handleApproval);
router.get('/requests', requestController.getAllRequests);
router.get('/request/:id', requestController.getRequestById);
router.put('/requests/:id/status', requestController.updateRequestStatus);

router.get('/requests/history', authMiddleware, requestController.getUserRequestHistory);

module.exports = router;
