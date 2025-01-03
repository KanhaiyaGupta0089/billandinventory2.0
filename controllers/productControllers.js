const upload = require("../multer");

const productModel = require("../models/ProductSchema");
const billModel = require("../models/billSchema");
const saveBillModel=require('../models/saveBillSchema')
var QRCode = require("qrcode");
const http = require("http");
const {client}=require('../reddis')
const { Parser } = require('json2csv');
const xlsx = require('xlsx');
const csvParser = require('csv-parser');
const fs=require('fs')

const NodeCache = require("node-cache");
const myCache = new NodeCache();








const createProduct = async (req, res) => {
  console.log(req.body)
  
  // var opts = {
  //     errorCorrectionLevel: 'H',
  //     type: 'image/jpeg',
  //     quality: 0.3,
  //     margin: 1,
  //     color: {
  //       dark:"#010599FF",
  //       light:"#FFBF60FF"
  //     }
  //   }

  //  console.log(req.file)
  //  console.log(req.body)
  let ProductQr = await QRCode.toDataURL(req.body.ProductId);
  //    console.log(ProductQr)
let ProductImage = req.file.path;
console.log(ProductImage)
  
  let {
    ProductId,
    ProductName, 
    ProductPrice, 
    ProductQuantity, 
    ProductCategory,
    
    
  } = req.body;
  // let ProductImage = image;
  let obj={
    ProductId,
    ProductName,
    ProductPrice,
    ProductQr,
    ProductQuantity,
    ProductCategory,
    ProductImage,

  }
  let createdProduct = await productModel.create({
    ProductId,
    ProductName,
    ProductPrice,
    ProductImage,
    ProductQr,
    ProductQuantity,
    ProductCategory,
  });
  console.log(createdProduct);
  // res.send("data inserted")
  req.flash("success", "Product Added Succesfully");

  const key = 'inventoryProducts'; // Key for the product array in Redis

// Retrieve the current array of products


// let products = await client.get(key);
// products = products ? JSON.parse(products) : []; // Parse or initialize an empty array

// Add the new product
// products.push(obj);
// await client.set(key, JSON.stringify(products));


// console.log(`Updated inventory:`, products);
  // res.redirect("/");
  // res.redirect("/product/entry")
  res.redirect("/")
};
 
function darkenRGB(color, amount) {
  let rgb = color.match(/\d+/g).map(Number); // Extract RGB values
  rgb = rgb.map(val => Math.max(val - amount * 255, 0)); // Darken the color by `amount`
  return `rgb(${rgb.join(', ')})`; // Return the darkened color as rgb format
}
const showProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;

  const limit = 15;
  const skip = (page - 1) * limit;
  let search = { ProductName: "bat", ProductPrice: 300 }; 
  let ans2 = await productModel.find({}); 
  let ans = ans2.slice(skip,skip+limit);
  

  
    
  

  
  //  console.log(ans);
  //  console.log(ans.ProductImage)
 

  const documentCount = await productModel.countDocuments();
  const categoriesWithColors = ans.map(category => (
    
    {
    
    name: category.ProductCategory,
    
    color: getRandomLightColor()
    
}));

   console.log(categoriesWithColors)
  res.render("bill-copy2", {
    ans,
    pagecount: Math.ceil(documentCount / limit),
    count: documentCount,
    limit,
    currPage:page,
    categoriesWithColors,
    ans2
    
  });
};


function getRandomLightColor() {
  // Generate a random light color by keeping RGB values in a higher range for lighter colors
  const r = Math.floor(Math.random() * 128) + 127; // Random value between 127 and 255
  const g = Math.floor(Math.random() * 128) + 127;
  const b = Math.floor(Math.random() * 128) + 127;
  return `rgb(${r}, ${g}, ${b})`;
}

const searchProduct = async (req, res) => {
  let searchTerm = req.query.q;
  
  try {
    
                let result = await productModel.find({
                  ProductName: new RegExp(searchTerm, "i"),
                  
                })
                res.json(result)
                
           
               

    // let result=await productModel.findOne({ProductId:searchTerm})
} catch (e) {
    console.error(e);
    res.status(500).send("Error occured while fetching");
  }
};
const qrSearchProduct = async (req, res) => {
  let searchTerm = req.query.q;
  try {
    let result = await productModel.findOne({ ProductId: searchTerm });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occured while fethcing");
  }
};
const deleteProduct = async (req, res) => {
  let deleteTerm = req.query.q;
  try {
    let deletedResult = await productModel.deleteOne({
      ProductName: new RegExp(deleteTerm, "i"),
    });
    res.send(`deleted count= ${deletedResult.deletedCount}`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error while deleting");
  }
};

const deleteProduct2 = async (req, res) => {
  let deleteTerm = req.params.id;
  console.log(deleteTerm)
  try {
    let deletedResult = await productModel.findOneAndDelete({ProductId:deleteTerm},{new:true})
    res.send(deletedResult);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error while deleting");
  }
};
const renderDelete = (req, res) => {
  res.render("delete2");
};
const renderUpdate = (req, res) => {
  // res.render('updateProduct')
  res.render("update-copy");
};
const updateProduct = async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    let img = "";
    if (req.file != undefined || req.file != null) img = req.file.path;
    console.log(img);

    let ProductQr = await QRCode.toDataURL(req.body.productId);

    const updateFields = {
      // Include other fields you want to update
      ProductName: data.productName,
      ProductPrice: data.price,
      ProductQr: ProductQr,
      ProductQuantity: data.quantity,
      ProductCategory: data.productCategory,
      ...(img && { ProductImage: img }),
    };
    let prod = await productModel.findOneAndUpdate(
      { ProductId: data.productId },
      {
        $set: updateFields,
      }
    );

    if (!prod) return res.status(201).json({ error: "Product does not exist" });
    req.flash("success1", "Product is Updated");

    res.redirect("/product/update");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProduct2 = async (req, res) => {
  try {
    let data = req.body;
    console.log(data);
    let img = "";
    if (req.file != undefined || req.file != null) img = req.file.path;
    console.log(img);

    let ProductQr = await QRCode.toDataURL(req.body.ProductId);

    const updateFields = {
      // Include other fields you want to update
      ProductName: data.ProductName,
      ProductPrice: data.ProductPrice,
      ProductQr: ProductQr,
      ProductQuantity: data.ProductQuantity,
      ProductCategory: data.ProductCategory,
      ...(img && { ProductImage: img }),
    };
    let prod = await productModel.findOneAndUpdate(
      { ProductId: data.ProductId },
      {
        $set: updateFields,
      }
    );

    if (!prod) return res.status(201).json({ error: "Product does not exist" });
    req.flash("success1", "Product is Updated");

    res.redirect("/product/entry");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const searchProductById = async (req, res) => {
  try {
    const pid = req.params.id;
    let prod = await productModel.findOne({ ProductId: pid });
    res.json(prod);
  } catch (err) {
    console.log(err);
    res.status(500).send("internal Server error");
  }
};

const sortDropdown=async (req,res)=>{
  let obj=JSON.parse(req.params.obj);
  console.log(obj)
  let {field,order,limit,page}=obj
  
  let skip=(page-1)*limit
  console.log(skip)
  
  
  let data=await productModel.find({}).skip(skip).limit(limit);
  let ans=data.sort((a, b) =>{
    if(order==="asc"){
     return a[field]-b[field]
    }
    else{
    return b[field]-a[field]
    }
  }); 
  
  res.json(ans)


}
const countProduct=async (req,res)=>{
    let count=await productModel.countDocuments()
    res.json({count:count})
}
const showReturnProduct=(req,res)=>{
  res.render('returnProduct')
}
const returnProduct=async (req,res)=>{
  let {billId,returnProducts}=req.body;
  let returnAmt=0
  
  console.log(billId)
  let i=0;
  try{
    const bill=await saveBillModel.findOne({BillId:billId})
    console.log("bill is",bill)
    if (!bill) {
      return res.status(404).json({ message: 'No matching bill or products found!' });
    }
    returnProducts.forEach((element) => {
      let {productId,productQuantity}=element;
      productQuantity=Number(productQuantity)
      console.log(productId,typeof productQuantity)
      // console.log(bill.Products)
      let product=bill.Products.find((item)=>item.ProductId==productId)
      console.log(product)
      if(product){
        

        if(product.ProductQuantity>productQuantity){
          product.ProductQuantity-=productQuantity
          returnAmt=returnAmt+product.ProductPrice*productQuantity
          bill.BillAmount-=returnAmt
          
        }
        else{
          const index=bill.Products.indexOf(product);
          if(index>-1)
          bill.Products.splice(index,1)
        }
      }
      
    });
    await bill.save()
    console.log(returnAmt)
      res.status(200).json({ message: `Products returned successfully! and return Amount = ${returnAmt}Rs` });
     
      
    


  }catch(err){
    console.error(err)
    res.status(500).json({error:err})
  }

}

const getAllCategory=async (req,res)=>{
  let sendCateg;

//   if(myCache.has("categories")){
//     sendCateg=JSON.parse(myCache.get("categories"))
//   }else{
//   let category=await productModel.distinct('ProductCategory') 
//   console.log(category)

//   let sendCateg=category.map((elem)=>({
//         name:elem,
//         color:getRandomLightColor()
//   }))

//   myCache.set("categories",JSON.stringify(sendCateg))
// }
  
//   res.json(sendCateg)
let ans=await productModel.find({})
let categ=new Set();
ans.map(category => (
  categ.add(category.ProductCategory)
    
  ));
  console.log(categ)
  categ=Array.from(categ)
  sendCateg=categ.map((item)=>(
    {
      name:item,
      color:getRandomLightColor()
    }
  ))
  // console.log(categ)
res.json(sendCateg)


  

}

const filterProduct=async(req,res)=>{
  
  
  
  let {category,priceRange,inFilter,outFilter}=req.query
  inFilter=JSON.parse(inFilter)
  outFilter=JSON.parse(outFilter)
  let prodQty=""
  if(inFilter&&outFilter){
    prodQty={$gte:0}
  }
  else if(!outFilter&&!inFilter){
    prodQty={$gte:0}
  }
  else if(inFilter)
    prodQty={$gt:0}
  else{
  prodQty=0
  }

  console.log(prodQty)
  
  
  let filterObj={
    
    ProductPrice:{$lte:priceRange},
    ProductQuantity:prodQty

  }
  if (category !== "All") {
    filterObj.ProductCategory = category; // Add category filter if not "All"
  }
  // console.log(q)
  let filter=await productModel.find(filterObj)
  res.json(filter)
  console.log(filter)

}



const getAllProduct=async(req,res)=>{
  let data;
  
  if(myCache.has("products")){
    data=JSON.parse(myCache.get("products"))
  }else{
    data=await productModel.find({})
    myCache.set("products",JSON.stringify(data))
  }
  res.json(data)
  
  
  

  
  
  
  
  
  
  
    
}

const updateById=async(req,res)=>{
  try{
  let {productId,quantity}=req.body;
  console.log(req.body)   
    
let update=await productModel.updateOne({ProductId:productId},{ProductQuantity:quantity},{new:true})
console.log(update)
// let update=await productModel.updateOne({ProductId:productId},{ProductQuantity:quantity},{new:true})
// let prod=await productModel.findById({ProductId:productId})
// console.log(prod)
res.json(update)
  // if(!update)
    // return res.send("error can not update product")
  // res.status(200).json(update)

}catch(err){
  console.error(err);
  res.status(500).json({error:err})
}

  
}
const showInputFromFile=(req,res)=>{
  res.render('fileInsert')
}


const InputFromFile=(req,res)=>{
  const fileExtension = req.file.originalname.split('.').pop();

  if (fileExtension === 'csv') {
    return bulkInsertProductsFromCSV(req, res);
} else if (fileExtension === 'xlsx') {
    return bulkInsertProductsFromExcel(req, res);
} else {
    return res.status(400).send({ message: 'Invalid file type. Please upload CSV or Excel file.' });
}
  console.log(req.file.path)
}

bulkInsertProductsFromCSV = async (req, res) => {
  try {
      const filePath = req.file.path;
      const products = [];

      // Parse CSV file
      fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => {
              products.push(row);
          })
          .on('end', async () => {
              // Insert into database
              const insertedProducts = await productModel.insertMany(products);
              fs.unlinkSync(req.file.path);
              res.status(200).send({ message: 'Bulk data inserted successfully!', data: insertedProducts });
          });
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error processing CSV file.', error });
  }
};
bulkInsertProductsFromExcel = async (req, res) => {
  try {
      const filePath = req.file.path;

      // Parse Excel file
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      // Insert into database
      const insertedProducts = await productModel.insertMany(sheetData);
      fs.unlinkSync(req.file.path);
      res.status(200).send({ message: 'Bulk data inserted successfully!', data: insertedProducts });
  } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error processing Excel file.', error });
  }
};

const showTableInsertion=(req,res)=>{
  res.render('insertFromTable')
}




module.exports = {
  createProduct,
  showProducts,
  searchProduct,
  qrSearchProduct,
  deleteProduct,
  deleteProduct2,
  renderDelete,
  updateProduct,
  searchProductById,
  renderUpdate,
  sortDropdown,
  countProduct,
  showReturnProduct,
  returnProduct,
  getAllCategory,
  filterProduct,
  updateProduct2,
  getAllProduct,
  updateById,
  InputFromFile,
  showInputFromFile,
  showTableInsertion
  
  
};
