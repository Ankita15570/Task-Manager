const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/AuthControllers');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/UploadMiddleware');

const router = express.Router();

//Auth Route
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

router.post('/upload-image', (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'file is not found' });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({ imageUrl });
    });
});

module.exports = router;