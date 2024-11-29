const jwt = require('jsonwebtoken')
const user = require('../models/user')
let JWT_SECRET_KEY="15975"
const protect = async (req, res, next) => {

    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, JWT_SECRET_KEY)
            req.user = await user.findById(decoded.id).select('-password')
            next()
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token Failed! Please try again.',
                error: err.message
            })
        }
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Not Authorized! Token is required."
        })
    }
}

const verifyAdmin = async (req, res, next) => { 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        
        try {
            console.log(JWT_SECRET_KEY)
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token,JWT_SECRET_KEY)
            const admin = await user.findOne({ _id: decoded.id, role: 'admin' }); 
            req.user = admin; 
            if (!admin) { 
                return res.status(403).json({
                    message: "Unauthorized Access!"
                })
            } 
            next()
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token Failed! Please try again.',
                error: err
            })
        }
    }
} 

module.exports = { protect, verifyAdmin }