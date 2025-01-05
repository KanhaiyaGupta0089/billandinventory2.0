const express = require("express");
const app = express();
const session = require("express-session");
const billModel = require("../models/billSchema");
const productModel = require("../models/ProductSchema");
const saveBillModel = require("../models/saveBillSchema");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const twilio = require("twilio");
const cors=require('cors')
var QRCode = require("qrcode");
app.use(cors())



// Twilio credentials from your account
const accountSid = "AC5c7b62a11f517f76721c6cb919716c17";
const authToken = "8b0e81d241a1283c4ac5ad4840e2dc89";
const client = twilio(accountSid, authToken);

const razorpay = new Razorpay({
  key_id: "rzp_test_tfx9olkFQFIWqI",
  key_secret: "9uIetaIgaNVMMtuypkqPZ52y",
});

app.use(
  session({
    secret: "abcd",
    resave: false,
    saveUnitialized: true,
  })
);

const getBill = async (req, res) => {
  let items = await productModel.find({});

  res.render("bill2-copy", {
    items,
    name: "kanhaiya",
    mob: 8879674523,
  });
};
const createBill = async (req, res) => {
  let { ProductId, ProductName, ProductPrice,ProductQuantity } = req.body;
  let prodFind=await billModel.findOne({ProductId:ProductId})
  if(prodFind){
    prodFind.ProductQuantity+=1
    await prodFind.save()
    res.send("bill updated");
  }else{
  let createdProduct = await billModel.create({
    ProductId,
    ProductName,
    ProductPrice,
    ProductQuantity
  });
  console.log(createdProduct);
  res.send("bill inserted");
}
};
const deleteBill = async (req, res) => {
  let data = await billModel.deleteMany({});
  console.log(data);
  return res.json({ deletedData: data });
};
const saveBillImage = async (req, res) => {
  //  console.log(req.body.image)
  let { screenshot, mobo, customer } = req.body;
  let bill = await saveBillModel.find({}).sort({ _id: -1 }).limit(1);
  let resbill = await saveBillModel.findByIdAndUpdate(
    bill[0]._id,
    { BillImage: screenshot, CustomerName: customer, MobileNumber: mobo },
    {
      new: true,
      runValidators: true,
    }
  );
  let bill2 = await saveBillModel.find({}).sort({ _id: -1 }).limit(1);
  // console.log("bill is",bill2)
  if (!resbill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  res.json({ bill: resbill });
};

const showBillImage = (req, res) => {
  res.render("showImage");
};
const getBillImage = async (req, res) => {
  //  console.log(req.query.q)
  let data = await saveBillModel.find({ BillId: req.query.q });

  res.json({ ans: data });
};
const printBill = async (req, res) => {
  
  let data = await billModel.find();
  //console.log(data);
  let res2=await fetch("https://billandinventory2-0.onrender.com/bill/billdelete")
  let ans=await res2.json();
  //console.log(ans);
  

  if (data.length > 0) {
    let save = await saveBillModel.find({});

    let billAmount = 0;
    data.map((item) => {
      billAmount += item.ProductPrice*item.ProductQuantity;
    });

    let billId = "B0";

    billId = billId.slice(0, 1) + Number(save.length+1);
    //console.log(billId);

    // let ans = await saveBillModel.create({
    //   BillId: billId,
    //   Products: data.map((item) => ({
    //     ProductId: item.ProductId,
    //     ProductName: item.ProductName,
    //     ProductPrice: item.ProductPrice,
    //   })),
    //   BillAmount: billAmount,
    // });
    // //console.log(ans);

    res.render("finalBillCopy copy", {
      data,
      billId,
      billAmount,
      // userDetail
    });
  } else {
    req.flash("warning1", "First Add the Products");
    res.redirect("/bill/");
  }
};
const payBill = async (req, res) => {
  const { amount } = req.body;

  try {
    let instance = new Razorpay({
      key_id: "rzp_test_tfx9olkFQFIWqI",
      key_secret: "9uIetaIgaNVMMtuypkqPZ52y",
    });

    let order = await instance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt#${Date.now()}`,
    });
    res.status(201).json({
      success: true,
      orderId: order.id,
      amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const sendEmail = async (req, res) => {
  let { billimg, cmail, cname } = req.body;
  let date = new Date();

  const doc = new PDFDocument();
  const outputPdfPath = path.join(
    __dirname,
    "..",
    "public",
    "pdfs", 
    `${Date.now()}.pdf`
  );

  const writeStream = fs.createWriteStream(outputPdfPath);
  doc.pipe(writeStream);
  doc.image(billimg, {
    fit: [500, 700], // Adjust size as needed
    align: "center",
    valign: "top",
  });
  doc.end();
  writeStream.on("finish", () => {
    console.log("PDF created successfully:", outputPdfPath);
  });

  let transporter = nodemailer.createTransport({
    service: "gmail", // Use 'gmail', 'outlook', or specify an SMTP server
    auth: {
      user: "gkanha1500@gmail.com", // Your email address
      pass: "xrya qogi ajxg ilth", // Your email password or app password
    },
  });
  let mailOptions = {
    from: "gkanha1500@gmail.com", // Sender's email address
    to: cmail, // Recipient's email address
    subject: "Your Bill Recipt Of Purchase", // Subject line
    // text: 'Hello, this is a test email sent from Node.js using Nodemailer.' // Plain text body
    // Optionally, you can use 'html' for HTML content:
    html: `
             <h1>Hello, ${cname}!</h1>
<h3>This is the bill reciept of the products you have purchased on ${date.toDateString()}</h3>
        `,
    attachments: [
      {
        path: outputPdfPath,
      },
    ],
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error occurred:", err);
      res.status(500).json({ error: err });
    } else {
      console.log("Email sent successfully:", info.response);
      res.status(200).json({ success: info.response });
    }
  });
};

const sendMessage = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const message = await client.messages.create({
      body: `Hello ${name}!<br>Thank you for shopping with kanha Ltd.`,
      from: "+1 412 357 2287", // Twilio number
      to: `+91${phone}`, // Receiver's number (must be verified in trial mode)
    });
    console.log(`Message sent with SID: ${message.sid}`);
    return res.json({ sid: message.sid });
  } catch (err) {
    console.error(`Failed to send message: ${err.message}`);
    res.status(500).json({ error: "message not sent" });
  }
};
const searchBillData = async (req,res) => {
  try {
    let BillId = req.params.BillId;
    let billData = await saveBillModel.findOne({ BillId });
    if(!billData)
      res.send("This is not our bill")


    res.status(200).json(billData.Products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};
const getBillCount = async (req, res) => {
  let bill = await saveBillModel.countDocuments();
  const result = await saveBillModel.aggregate([
    {
      $unwind: "$Products", // Break down products array into individual documents
    },
    {
      $group: {
        _id: "$Products.ProductId", 
        totalCount: { $sum: 1 }, // Count each occurrence of the product
      },
    },
    {
      $group: {
        _id: null,
        totalProductsAcrossBills: { $sum: "$totalCount" }, // Sum all product occurrences
        totalProductsById: {
          $push: { productId: "$_id", count: "$totalCount" }, // Collect counts for each product
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProductsAcrossBills: 1,
        totalProductsById: 1,
      },
    },
  ]);
  console.log(result);

  res.json({ billCount: bill, pselled: result });
};
const createFinalBill=async (req,res)=>{
  try{
  let{billId,data,billAmount}=req.body
  let ans = await saveBillModel.create({
    BillId: billId,
    Products: data.map((item) => ({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      ProductPrice: item.ProductPrice,
      ProductQuantity:item.ProductQuantity
    })),
    BillAmount: billAmount,
  });
  console.log(ans);
  res.status(200).json(ans);
}catch(err){
  console.error(err)
  res.status(500).json({error:err})
}

}

const createUpiPayment=async(req,res)=>{
  const { amount, customerName } = req.body;
console.log(req.body) 
  try {
    // Create order for payment
    
    let upiId='test@upi'
    const upiLink = `upi://pay?pa=${upiId}&pn=${customerName}&am=${amount}&cu=INR`;
    console.log(upiLink)
    const qrCode=await QRCode.toDataURL(upiLink)
    

    const order=await razorpay.orders.create({
      amount: amount * 100, // Amount in paise (e.g., 500 INR = 50000 paise)
      currency: "INR",
      receipt: `order_rcptid_${new Date().getTime()}`,
      payment_capture: 1,
      
    });
    

    
    
    
         
    
    


    // Send response with order details and QR code URL
    res.json({
      success:true,
      orderId:order.id,
      qrCode: qrCode,
      
    });
  } catch (error) {
    console.error('Error creating payment order', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
}

const verifyPayment=async(req,res)=>{
  const { paymentId,amount } = req.body;
  console.log(req.body)

  try {
    // Fetch payment details from Razorpay API
    // const paymentDetails = await razorpay.payments.fetch(paymentId);
    let capturedPayment = await razorpay.payments.capture(paymentId, amount);
     console.log(capturedPayment.status)
    // Check if the payment is successful
    if (capturedPayment.status === 'captured') {
      res.json({ success: true });
    } else {
      res.json({ success: false }); 
    }
  } catch (error) {
    console.error('Error verifying payment', error);
    res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
}

const displayBillHistory=async (req,res)=>{
  
  
  let showBill=await saveBillModel.find({}).sort({_id:-1}).limit(10)
  res.render('displayBill',{showBill})
}
 


module.exports = {
  getBill,
  createBill,
  deleteBill,
  saveBillImage,
  showBillImage,
  getBillImage,
  printBill,
  payBill,
  sendEmail,
  sendMessage,
  searchBillData,
  getBillCount,
  createFinalBill,
  createUpiPayment,
  verifyPayment,
  displayBillHistory
};
