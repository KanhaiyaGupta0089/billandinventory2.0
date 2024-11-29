const express = require('express')
const router = express.Router()

const {registerUser, loginUser} = require('../controllers/authController')
const { verifyAdmin } = require('../middleware/authMiddleware')

router.post('/register', verifyAdmin ,registerUser)
router.post('/login2', loginUser)

module.exports = router   