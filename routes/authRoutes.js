const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');


router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/:id', protect, authorize('Admin'), updateUser);

module.exports = router;
