
const { Schema,model, default: mongoose } = require("mongoose");
const saveBillSchema = require("./saveBillSchema");
const saveBill=require('./saveBillSchema')
// mongoose.connect('mongodb+srv://gkanha1500:lBg0JFvUEkfr2FIH@cluster0.s1yoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/formsubmit').then(() => console.log('MongoDB Atlas connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// mongoose.connect('mongodb://localhost:27017/formsubmit').then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

const udharSchema=new Schema({
    BillId:{
        type:String,
        ref:saveBill
        
    },
    CustomerName:{
        type:String,
        default:""
    },
    CustomerEmail:{
        type:String,
        default:""
    },
    MobileNumber:{
            type:Number,
            default:0
    },

    
    BillAmount:{
        type:String,
        default:0,
        required:true
    },
    DateOfPaying:{
        type:Date,
        required:true 
    },
    Products:[{
        ProductId:{
            type:String,
            required:true
        },
        ProductName:{
            type:String,
            required:true,
        },
        ProductPrice:{
            type:Number,
            required:true
        }

    }]
    
   
})
module.exports=mongoose.model("udhar",udharSchema);