const express=require('express');



const router=express.Router();
const {showUdhar,renderDayBook,getEmpDetail,renderEmpList,addEmployee,getAllDayData,saveDayBook,deleteUdhar,renderReport,updateUdhar,showAllUdhar,handleUdhar,renderUdharKhatas}=require('../controllers/userController')

router.get('/udhar',showUdhar)
router.post('/day-book',saveDayBook)
router.post('/udhar',handleUdhar)
router.get('/udhar-khatas',renderUdharKhatas)
router.get('/all-udhar',showAllUdhar)
router.post('/update-khata',updateUdhar)
router.delete('/delete-khata',deleteUdhar)
router.get('/chart-report',renderReport)
router.get('/day-book',renderDayBook)
router.get('/day-data',getAllDayData) 
router.get('/emp-list',renderEmpList)
router.post('/add-emp',addEmployee)
router.get('/emp-detail',getEmpDetail)

module.exports=router;

