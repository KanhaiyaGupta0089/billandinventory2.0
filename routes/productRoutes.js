const express=require('express');

const app=express()

const router=express.Router();
const { createProduct,countProduct,updateById,showInputFromFile,deleteProduct2,updateProduct2,getAllCategory,filterProduct,showReturnProduct,returnProduct,sortDropdown,searchProductById,renderUpdate,updateProduct,showProducts,searchProduct,qrSearchProduct,deleteProduct,renderDelete,customWork,getAllProduct,InputFromFile,showTableInsertion} = require('../controllers/productControllers');

const upload=require('../multer')


router.get('/entry',showProducts)
router.post('/create',upload.single('image'),createProduct)
router.get('/count-product',countProduct)
router.get('/search',searchProduct)
router.get('/search/:id',searchProductById)
router.get('/qrsearch',qrSearchProduct)
router.get('/del',renderDelete)
router.get('/delete',deleteProduct)  
router.get('/delete2/:id',deleteProduct2)  
router.post('/update',upload.single('image'),updateProduct)
router.post('/update2',upload.single('image'),updateProduct2)
router.get('/update',renderUpdate)
router.get('/filter/:obj',sortDropdown)
router.get('/return',showReturnProduct) 
router.post('/return',returnProduct)
router.get('/all-category',getAllCategory)
router.get('/prod-filter',filterProduct)
router.get('/get-all-prod',getAllProduct)
router.post('/update-id',updateById)
router.get('/show-file',showInputFromFile)
router.post('/insert-data',upload.single('data-file'),InputFromFile)
router.get('/show-table',showTableInsertion)

 

    
module.exports=router