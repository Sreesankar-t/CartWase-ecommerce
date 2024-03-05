const express = require('express')
const router = express.Router()
const { verifyLoginadmin, upload } = require('../helpers/middleware')

const path = require('path')
const multer = require('multer')

const {
  adminhomepageget,
  adminhomepagepost,
  addproductsget,
  addproductspost,
  editProductget,
  editProductpost,
  unhideproductget,
  hideproductget,
  dashbordget,
  adminloginget,
  adminloginpost,
  adminlogoutget,
  userdataget,
  userdatapost,
  blockuserget,
  unblockuserget,
  categoryget,
  addcategoryget,
  addCategorypost,
  deleteCategoryget,
  editCategoryget,
  editCategorypost,
  hideCategoryget,
  unhideCategoryget,
  userOrderget,
  statuschangeget,
  userorderpost,
  bannerget,
  addbannerget,
  addbannerpost,
  AddBannerget,
  deletebannerget,
  viewCouponGet,
  addCouponGet,
  addCouponPost,
  editCouponGet,
  editCouponPost,
  deleteCouponPost,
  errorpageget,
  salesReport,
  salesReports,
  dateFilterPost
} = require('../controller/admin-controller')

router.get('/', verifyLoginadmin, adminhomepageget)

router.post('/', verifyLoginadmin, adminhomepagepost)

router.get('/add-products', verifyLoginadmin, addproductsget)

router.post(
  '/add-products',
  verifyLoginadmin,
  upload.array('Image', 4),
  addproductspost
)

router.get('/edit-product/:id', verifyLoginadmin, editProductget)

router.post(
  '/edit-product/:id',
  verifyLoginadmin,
  upload.array('Image', 4),
  editProductpost
)

router.get('/hide-product/:id', verifyLoginadmin, hideproductget)

router.get('/unhide-product/:id', verifyLoginadmin, unhideproductget)
// dashbord start //
router.get('/dashbord', verifyLoginadmin, dashbordget)

// dashbod end //
router.get('/adminLogin', adminloginget)

router.post('/adminLogin', adminloginpost)

router.get('/adminLogout', verifyLoginadmin, adminlogoutget)

//user management start//
router.get('/user-data', verifyLoginadmin, userdataget)

router.post('/user-data', verifyLoginadmin, userdatapost)

router.get('/block-user/:id', verifyLoginadmin, blockuserget)

router.get('/unblock-user/:id', verifyLoginadmin, unblockuserget)
//user management end//

//category managemnet start//
router.get('/category', verifyLoginadmin, categoryget)

router.get('/add-category', verifyLoginadmin, addcategoryget)

router.post(
  '/add-category',
  verifyLoginadmin,
  upload.array('Image', 1),
  addCategorypost
)

router.get('/delete-category/:id', deleteCategoryget)

router.get('/edit-category/:id', editCategoryget)

router.post(
  '/edit-category/:id',
  verifyLoginadmin,
  upload.array('Image', 1),
  editCategorypost
)

router.get('/hide-category/:id', verifyLoginadmin, hideCategoryget)

router.get('/unhide-category/:id', verifyLoginadmin, unhideCategoryget)

router.get('/user-order', userOrderget)
router.post('/user-order', userorderpost)

router.get('/status-change', statuschangeget)

// category management end//

// banner management get method //
router.get('/banners', bannerget)

// add banner get method /
router.get('/addBanner', addbannerget)

// banner management post /
router.post('/addBanner', addbannerpost)

// add-banner get //

router.get('/add-banner', AddBannerget)

//delete-banner get //
router.get('/delete-banner/:id', verifyLoginadmin, deletebannerget)

// coupon management start//
router.get('/view-coupon', verifyLoginadmin, viewCouponGet)

router.get('/add-coupon', verifyLoginadmin, addCouponGet)

router.post('/add-coupon', verifyLoginadmin, addCouponPost)

router.get('/edit-coupon/:id', verifyLoginadmin, editCouponGet)

router.post('/edit-coupon', verifyLoginadmin, editCouponPost)

router.post('/delete-coupon', verifyLoginadmin, deleteCouponPost)

// coupon management end //

//error-page//
router.get('/error-page', errorpageget)
//error-page end//
// sales report  start//

router.get('/sales', salesReport)
router.get('/sales-report', salesReports)
router.post('/date-filter', dateFilterPost)
// sales report end //

module.exports = router
