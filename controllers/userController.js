const udharModel=require('../models/udharSchema')
const saveBillModel=require('../models/saveBillSchema')
const dayBookModel=require('../models/dayBookSchema')
const userModel=require('../models/user')
const bcrypt=require('bcryptjs')
const showUdhar=(req,res)=>{
    res.render('udhar')
}
const handleUdhar=async (req,res)=>{
    let {customerName,date,billAmount,CustomerEmail,BillId,MobileNumber}=req.body;
    console.log(req.body)
    let products=await saveBillModel.findOne({BillId})
    console.log(products)
    if(!products)
        return res.redirect("/user/udhar")
    
    
    let udhar=new udharModel({
        BillId,
        CustomerName:customerName,
        DateOfPaying:date,
        MobileNumber,
        CustomerEmail,
        BillAmount:billAmount,
        Products:products.Products,
        
    })
    let savedData=await udhar.save();
    console.log(savedData) 
    
    res.redirect('/user/udhar-khatas')
} 
const renderUdharKhatas=(req,res)=>{
    res.render('showUdharKhata')
}

const showAllUdhar=async (req,res)=>{
    try{
    let udata=await udharModel.find();
    res.status(200).json(udata)
    }catch(err){
        console.error(err);
        res.status(500).send("internal server error")
    }

}

const updateUdhar=async (req,res)=>{
    try{
        let data=req.body;
        let udhar=await udharModel.findOneAndUpdate({CustomerName:data.customerName},{
            CustomerName:data.customerName,
            BillAmount:data.BillAmount
        },{new:true})
        res.send(udhar)
    }catch(err){
        console.error(err)
        res.status(500).send("udhar not updated")
    }
}
const deleteUdhar=async(req,res)=>{
    let customerName=req.body.cname
    let deletedUdhar=await udharModel.findOneAndDelete({CustomerName:customerName},{new:true})
    res.send(deletedUdhar)
}

const renderReport=async(req,res)=>{
    res.render('chartReports')
}
const renderDayBook=(req,res)=>{
    res.render('dayBook')
}
const saveDayBook=async (req,res)=>{
    try{
    let{productCount,customerName,billAmount}=req.body;
    console.log(req.body)
    let addDayData=new dayBookModel({
        CustomerName:customerName,
        Amount:Number(billAmount),
        ProductCount:productCount
    })
    let saveDayData=await addDayData.save()
    console.log(saveDayData)

    res.json(saveDayData)
}catch(err){
    console.error(err)
    res.status(500).send(err)
}
}

const getAllDayData=async(req,res)=>{
    try{
        
    // let allData=await dayBookModel.find({Date:new Date().toDateString()})
    // console.log(allData)
    const today = new Date();
today.setHours(0, 0, 0, 0);
    let billData=await saveBillModel.find({BillDate:{$gte:today}})
    console.log("today bills",billData)
    

    let allData=[]
    billData.forEach((bill)=>{
    
    
        
        

        let obj={
            'CustomerName':bill.CustomerName,
            'Date':bill.BillDate.toDateString(),
            'ProductCount':bill.Products.length,
            
        }
        obj['Amount']=bill.BillAmount
        allData.push(obj)
    
    })
res.status(200).json(allData)
    }catch(err){
        console.error(err)
        res.status(500).send({err})
    }
}


const renderEmpList=(req,res)=>{
    res.render('employeeList')
}
const addEmployee=async (req,res)=>{ 
    const {empName,Mobo,empEmail,empPwd,empSalary}=req.body;
    const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(empPwd, salt)
    let empAdd=await userModel.create({
        name:empName,
        email:empEmail,
        password:hashedPassword,
        MobNo:Mobo,
        Salary:empSalary,


    })
    console.log(empAdd);
    res.json(empAdd)
     
}
const getEmpDetail=async(req,res)=>{
    let empData=await userModel.find({role:"employee"})
    
    res.json(empData)
}

const renderInventoryDashboard=(req,res)=>{
    res.render('inventoryDashboard')
}

const getSaleReport=async (req,res)=>{
     let type=req.params.type;
     const today = new Date();
today.setHours(0, 0, 0, 0);
today.setDate(today.getDate()-7)
     let report=await saveBillModel.aggregate([
        {
            $match:{
                BillDate:{$gte:today}
            }
        },
        {
            $project:{
                BillDate:{$dateToString:{format:"%Y-%m-%d",date:"$BillDate"}},
                BillAmount:{$toDouble:"$BillAmount"}
            }
            },
            {
                $group:{
                _id:"$BillDate",
                totalSales:{$sum:"$BillAmount"},
                // count:{$count:{}}
            }
        },
        {
            $sort:{_id:1}
        }
        ])
     console.log(report)
     

     res.json(report)
    
}
module.exports={
    showUdhar,
    handleUdhar,
    renderUdharKhatas,
    showAllUdhar,
    updateUdhar,
    deleteUdhar,
    renderReport,
    renderDayBook,
    saveDayBook,
    getAllDayData,
    addEmployee,
    renderEmpList,
    getEmpDetail,
    renderInventoryDashboard,
    getSaleReport
}