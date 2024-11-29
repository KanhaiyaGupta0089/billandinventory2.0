
const { Schema,model, default: mongoose } = require("mongoose");
// mongoose.connect('mongodb+srv://gkanha1500:lBg0JFvUEkfr2FIH@cluster0.s1yoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/formsubmit').then(() => console.log('MongoDB Atlas connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// mongoose.connect('mongodb://localhost:27017/formsubmit').then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));




const dayBookSchema=new Schema({
    CustomerName:{
        type:String,
        default:""
    },
   Amount:{
    type:Number,
    required:true
    
   },
   Date:{
    type:Date,
    default:new Date().toDateString()
   },
   ProductCount:{
    type:Number,
    required:true,
   }
    
    
   
})
dayBookSchema.pre('save',async function(next){
    const bill=this;
    bill.Amount=bill.Amount+'Rs'
    next();

})
module.exports=mongoose.model("dayBook",dayBookSchema);