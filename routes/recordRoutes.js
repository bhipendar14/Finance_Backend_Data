const express = require('express');
const router = express.Router();
const {
    createRecord,
    getRecords,
    getRecordById,
    updateRecord,
    deleteRecord
} = require('../controllers/recordController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All record routes require authentication
router.use(protect);

// Admin only: create, update, delete
router.post('/', authorize('Admin'), createRecord);
router.put('/:id', authorize('Admin'), updateRecord);
router.delete('/:id', authorize('Admin'), deleteRecord);

// Viewer, Analyst, Admin: read
router.get('/', authorize('Viewer', 'Analyst', 'Admin'), getRecords);
router.get('/:id', authorize('Viewer', 'Analyst', 'Admin'), getRecordById);

module.exports = router;
