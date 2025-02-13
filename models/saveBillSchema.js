
const { Schema,model, default: mongoose } = require("mongoose");
// mongoose.connect('mongodb+srv://gkanha1500:lBg0JFvUEkfr2FIH@cluster0.s1yoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/formsubmit').then(() => console.log('MongoDB Atlas connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// mongoose.connect('mongodb://localhost:27017/formsubmit').then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

const moment = require('moment-timezone');
const localDate = moment().tz("Asia/Kolkata").format();  // Adjusts to your local time zone





const saveBillSchema=new Schema({
    
    BillId:{
        type:String,  
        required:true,
        
    },
    CustomerName:{
        type:String,
        default:""
    },
MobileNumber:{
            type:Number,
            default:0
    },

    BillImage:{
        type:String,
        default:""
        
    }, 
    BillAmount:{
        type:Number,
        default:0,
        required:true
    },
    BillDate:{
        type:Date,
        default:localDate
    },
    Products:[{
        ProductId:{
            type:String,
            required:true,
            
        },
        ProductName:{
            type:String,
            required:true,
        },
        ProductPrice:{
            type:Number,
            // required:true
            default:0
        },
        ProductQuantity:{
            type:Number,
            default:0
        },
        

    }]
    
    
   
})
// saveBillSchema.pre('save',async function(next){
//     const bill=this;
//     bill.BillAmount=bill.BillAmount
//     next();

// })
module.exports=mongoose.model("saveBill",saveBillSchema);
