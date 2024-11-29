const mongoose = require('mongoose')
// const {createAdmin}=require('../controllers/authController')


const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee'
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    MobNo:{
        type:Number,
        
    },
    Salary:{
        type:Number
    }

}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)