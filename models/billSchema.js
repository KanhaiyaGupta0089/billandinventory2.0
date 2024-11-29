
const { Schema,model, default: mongoose } = require("mongoose");
// mongoose.connect('mongodb+srv://gkanha1500:lBg0JFvUEkfr2FIH@cluster0.s1yoo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/formsubmit').then(() => console.log('MongoDB Atlas connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// mongoose.connect('mongodb://localhost:27017/formsubmit').then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

const billSchema=new Schema({
   
    ProductId:{
        type:String,
        // required:true,
        
    },
    ProductName:{
        type:String,
        // required:true
    },
    ProductPrice:{
        type:Number,
        // required:true
    },
    ProductQuantity:{
        type:Number,
        required:true
    }
   
})
module.exports=mongoose.model("bill",billSchema);