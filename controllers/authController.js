const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const adminEmail = 'test@gmail.com'
const adminPassword = "testingPassword"

let JWT_SECRET_KEY="15975"
const createAdmin = async () => {
    
   try {
        const admin = await User.findOne({ email: adminEmail })
        if (!admin) {
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(adminPassword, salt)
            const newAdmin = new User({
                email: adminEmail,
                password: hashPassword, 
                role: 'admin'
            })
            await newAdmin.save() 
            console.log(newAdmin)
        } else { 
            console.log("Admin Already exist!")
        }
        
   } catch (err) {
       console.log('Internal Server error!')
       console.error(err)
    }
}

const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (user) {
            return res.status(401).json({
                message: "User Already exists!" 
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({
            email,
            password: hashedPassword
        })
        if(newUser) {
            return res.status(201).json({
                message: "User Created Successfully!",
                newUser
            })
        } else {
            return res.status(401).json({
                message: "Something went wrong! Please try again."
            })
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Internal Server Error!',
            error: err.message
        })
    }
}


const loginUser = async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;
        console.log(req.body)
        const createdUser = await User.findOne({ email })
        if (!createdUser) {
            return res.status(404).json({
                success: false,
                message: "User not Found!"
            })
        }

        const isMatch = await bcrypt.compare(password, createdUser.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password or email address!" 
            })
        }
        const token = jwt.sign({ id: createdUser._id }, JWT_SECRET_KEY, { expiresIn: '1h' })
        
        if (token){
            // res.status(200).json({
            //     success: true, 
            //     token,
            //     user: {
            //         name: createdUser.name,
            //         email: createdUser.email
            //     }
            // })
            res.redirect('/dashboard')
        } else {
            res.status(403).json({
                success: false,
                message: "Token is Missing!"
            })
        }

    } catch (err) {
        res.status(400).json({
            success: false,
            message: `${err}`,
            error: err
        })
    }
}

module.exports = { 
    createAdmin, 
    loginUser, 
    registerUser 
} 