const express=require('express');
const app=express()
const router=express.Router();
let{getBill,sendEmail,getBillCount,verifyPayment,displayBillHistory,createUpiPayment,createFinalBill,searchBillData,createBill,sendMessage,deleteBill,payBill,saveBillImage,showBillImage,getBillImage,printBill}=require('../controllers/billControllers')




router.get('/',getBill)
router.post('/create-bill',createBill)
router.get('/billdelete',deleteBill)
router.get('/bill-data/:BillId',searchBillData)
router.post('/payment',payBill)
router.post('/create-finalbill',createFinalBill)
router.put('/savebillimage',saveBillImage)
router.get('/showpage',showBillImage)
router.get('/showimage',getBillImage)
router.post('/printbill',printBill)
router.post('/send-email',sendEmail)
router.post('/send-message',sendMessage)
router.get('/bill-count',getBillCount)
router.post('/create-upi-payment',createUpiPayment)
router.post('/verify-payment',verifyPayment)
router.get('/display-bills',displayBillHistory)



module.exports=router