const express = require('express')
const router = express.Router()
const productHelpers = require('../helpers/product-helpers')
const adminHelpers = require('../helpers/admin-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const multer = require('multer')
const upload = multer({ dest: 'public/images' })
const path = require('path')
const fs = require('fs')
const userHelpers = require('../helpers/user-helpers')
const { log } = require('handlebars/runtime')

function adminhomepageget (req, res, next) {
  const admin = req.session.admin
  let val = Number(req.query.p)
  productHelpers.getAllProductsPagination(val).then(products => {
    console.log(products)
    res.render('admin/view-products', { admin: true, products })
  })
}

function adminhomepagepost (req, res, next) {
  const admin = req.session.admin
  let searchq = String(req.body.search)
  productHelpers
    .searchProducts(searchq)
    .then(products => {
      res.render('admin/view-products', { products, admin })
    })
    .catch(err => {
      console.log(err)
      res.render('/error-page')
    })
}

function adminloginget (req, res) {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('admin/login', { loginErr: req.session.adminLoginErr })
    req.session.adminLoginErr = false
  }
}

function adminloginpost (req, res) {
  console.log('hello')

  let details = req.body
  adminHelpers.doLogin(details).then(response => {
    if (response.status) {
      console.log('Admin successfully logged in')
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      res.redirect('/admin/dashbord')
    } else {
      req.session.adminLoginErr = 'Invalid username or password'
      res.redirect('/admin/adminLogin')
    }
  })
}

addproductsget = async (req, res) => {
  const admin = req.session.admin
  let category = await categoryHelpers.getAllCategory()
  res.render('admin/add-products', { admin, category })
}

async function addproductspost (req, res) {
  console.log(req.files)

  const { No, Name, Category, Price, Description } = req.body
  console.log(req.body)
  console.log(req.files)
  const currentDate = new Date()
  const photos = req.files.map(file => {
    const oldPath = `${file.path}`
    const newPath = `${file.path}.png`
    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
        console.log('file renamed')
      })
    } else {
      console.log('not renamed')
    }
    return {
      // id:  path.basename(newPath),
      title: file.originalname,

      fileName: newPath.replace(/public/gi, '')
      //  filepath: file.path.replace(/views/gi,"")
    }
  })
  console.log(photos)

  productHelpers.addProduct(
    {
      No: No,
      Name: Name,
      Category: Category,
      Price: Price,
      Description: Description,
      photos: photos,
      date: currentDate
    },
    id => {
      req.session.admin.loggedIn = true
      res.redirect('/admin')
    }
  )
}

editProductget = async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  let category = await categoryHelpers.getAllCategory()
  console.log(product)
  res.render('admin/edit-product', { admin: true, product, category })
}

function editProductpost (req, res) {
  const { No, Name, Category, Price, Description } = req.body
  const photos = req.files.map(file => {
    const oldPath = `${file.path}`
    const newPath = `${file.path}.png`
    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
      })
      return {
        id: path.basename(newPath),
        title: file.originalname,
        fileName: newPath.replace(/public/gi, '')
      }
    } else {
      return null // Return null for the file that was not uploaded
    }
  })

  productHelpers
    .getProductDetails(req.params.id) // Fetch the existing product
    .then(product => {
      const existingPhotos = product.photos // Get the existing photos

      // Replace the existing photo with the newly uploaded photo, if available
      const updatedPhotos = photos.length > 0 ? photos : existingPhotos

      productHelpers
        .updateProduct(req.params.id, {
          No: No,
          Name: Name,
          Category: Category,
          Price: Price,
          Description: Description,
          photos: updatedPhotos
        })
        .then(() => {
          res.redirect('/admin')
        })
    })
}

hideproductget = (req, res) => {
  let proId = req.params.id
  productHelpers.hideproduct(proId).then(() => {
    res.redirect('/admin')
  })
}

unhideproductget = (req, res) => {
  let proId = req.params.id
  productHelpers.unhideproduct(proId).then(() => {
    res.redirect('/admin')
  })
}

dashbordget = (req, res) => {
  res.render('admin/dashbord', { admin: true })
}

dashbordget = (req, res) => {
  Promise.all([
    adminHelpers.getAllLatestOrders(),
    adminHelpers.getAllLatestUsers(),
    adminHelpers.totalUser(),
    adminHelpers.totalProduct(),
    adminHelpers.totalAmount(),
    adminHelpers.getSellingProductInEachMonth(),
    adminHelpers.getSellingProductInEachMonth1(),
    adminHelpers.paymentMethodCount(),
    adminHelpers.orderLastWeek()
  ])
    .then(
      ([
        latestorder,
        latestuser,
        totaluser,
        totalproduct,
        totalAmount,
        monthlydata,
        productSells,
        paymentCounts,
        sales
      ]) => {
        let productSell = JSON.stringify(productSells)
        let month = monthlydata.month
        let amount = monthlydata.amounts
        console.log(month, amount)

        res.render('admin/dashbord', {
          admin: true,
          latestorder,
          latestuser,
          totaluser,
          totalproduct,
          totalAmount,
          // month,
          // amount,
          paymentCounts,
          sales,
          productSell
        })
      }
    )
    .catch(error => {
      console.error(error)
      // Handle the error
      res.render('admin/error', { admin: true })
    })
}

adminlogoutget = (req, res) => {
  req.session.destroy()
  res.redirect('/admin/adminLogin')
}

//user management start//
userdataget = async (req, res) => {
  try {
    const admin = req.session.admin
    let val = Number(req.query.p)
    console.log(val)
    let users = await adminHelpers.getAlluserPagination(val)
    console.log(users)
    res.render('admin/all-users', { admin: true, users })
  } catch (error) {
    console.error('Error retrieving user data:', error)
    res.status(500).send('Error retrieving user data')
  }
}

function userdatapost (req, res, next) {
  const admin = req.session.admin
  let searchq = String(req.body.search)
  productHelpers
    .searchuser(searchq)
    .then(users => {
      res.render('admin/all-users', { users, admin })
    })
    .catch(err => {
      console.log(err)
      res.render('admin/all-users', { err, admin })
    })
}

blockuserget = (req, res) => {
  let userId = req.params.id
  adminHelpers.blockUser(userId).then(() => {
    res.redirect('/admin/user-data')
  })
}

unblockuserget = (req, res) => {
  let userId = req.params.id
  adminHelpers.unBlockUser(userId).then(() => {
    res.redirect('/admin/user-data')
  })
}

//user management end//
//category management start//
function categoryget (req, res, next) {
  let admin = req.session.admin
  let val = Number(req.query.p)
  console.log(val)
  categoryHelpers.getAllcategoryPagination(val).then(category => {
    console.log(category)
    res.render('admin/category', { admin: true, category })
  })
}

addcategoryget = (req, res) => {
  res.render('admin/add-category', {
    catError: req.session.catError,
    admin: true
  })
  req.session.catError = false
}

function addCategorypost (req, res) {
  const { Category } = req.body
  console.log(req.body)
  console.log(req.files)

  const photos = req.files.map(file => {
    const oldPath = `${file.path}`
    const newPath = `${file.path}.png`
    if (fs.existsSync(oldPath)) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err
      })
    } else {
      console.log('not renamed')
    }
    return {
      // id:  path.basename(newPath),
      title: file.originalname,

      fileName: newPath.replace(/public/gi, '')
      //  filepath: file.path.replace(/views/gi,"")
    }
  })
  console.log(photos)

  categoryHelpers
    .addCategory({ Category: Category, photos: photos })
    .then(data => {
      if (data) {
        res.redirect('/admin/category')
      } else {
        req.session.catError = 'Category Allready Exist'
        res.redirect('/admin/add-category')
      }
    })
}

deleteCategoryget = (req, res) => {
  let catId = req.params.id
  console.log(catId)
  categoryHelpers.deleteCategory(catId).then(response => {
    res.redirect('/admin/')
  })
}

editCategoryget = async (req, res) => {
  let category = await categoryHelpers.getCategoryDetails(req.params.id)
  console.log(category)
  res.render('admin/edit-category', {
    category,
    admin: true,
    catError: req.session.catError
  })
  req.session.catError = false
}

async function editCategorypost (req, res) {
  try {
    const { Category } = req.body
    const photos = req.files.map(file => {
      const oldPath = `${file.path}`
      const newPath = `${file.path}.png`
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath)
        return {
          id: path.basename(newPath),
          title: file.originalname,
          fileName: newPath.replace(/public/gi, '')
        }
      } else {
        return null // Return null for the file that was not uploaded
      }
    })

    const category = await categoryHelpers.getCategoryDetails(req.params.id) // Fetch the existing category
    const existingPhotos = category.photos // Get the existing photos

    // Remove old photos from the database
    const oldPhotoFileNames = existingPhotos.map(photo => photo.fileName)
    oldPhotoFileNames.forEach(fileName => {
      const filePath = `public/${fileName}`
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })

    // Replace the existing photo with the newly uploaded photo, if available
    const updatedPhotos =
      photos.filter(photo => photo !== null).length > 0 ? photos : []

    await categoryHelpers.updateCategory(req.params.id, {
      Category: Category,
      photos: updatedPhotos
    })

    res.redirect('/admin/category')
  } catch (error) {
    // Handle and log any errors that occur
    console.error(error)
    res.status(500).send('An error occurred while updating the category.')
  }
}

hideCategoryget = (req, res) => {
  let catId = req.params.id
  categoryHelpers.hideCategory(catId).then(() => {
    res.redirect('/admin/category')
  })
}

unhideCategoryget = (req, res) => {
  let catId = req.params.id
  categoryHelpers.unhideCategory(catId).then(() => {
    res.redirect('/admin/category')
  })
}

userOrderget = async (req, res) => {
  try {
    const admin = req.session.admin
    let val = Number(req.query.p)
    console.log(val)
    let usersOrders = await adminHelpers.getAlluserOrderPagination(val)
    console.log(usersOrders)
    res.render('admin/user-order', { admin: true, usersOrders })
  } catch (error) {
    console.error('Error retrieving user data:', error)
    res.status(500).send('Error retrieving user data')
  }
}

function userorderpost (req, res, next) {
  const admin1 = req.session.admin
  let searchq = String(req.body.search.trim())
  productHelpers
    .searchUserOrder(searchq)
    .then(usersOrders => {
      res.render('admin/user-order', { usersOrders, admin1, admin: true })
    })
    .catch(err => {
      console.log(err)
      res.render('admin/user-order', { err, admin1 })
    })
}

statuschangeget = async (req, res) => {
  let id = req.query.id
  let status = req.query.st
  adminHelpers.cancelOrder(id, status)
  res.redirect('/admin/user-order')
}

//category management end//

// banner maangement  start//
bannerget = async (req, res) => {
  let banners = await adminHelpers.getBanners()
  res.render('admin/banners', { admin: true, banners })
}

addbannerget = (req, res) => {
  res.render('admin/add-banner', { admin: true })
}

addbannerpost = (req, res) => {
  upload.array('Image')(req, res, async err => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during file upload
      console.log(err)
      res.redirect('/admin/addBanner')
    } else if (err) {
      // An unknown error occurred during file upload
      console.log(err)
      res.redirect('/admin/addBanner')
    } else {
      if (!req.files || req.files.length === 0) {
        // Image file is not selected
        console.log('No image selected')
        res.redirect('/admin/addBanner')
        return
      }

      const photos = req.files.map(file => {
        const oldPath = file.path
        const newPath = `${file.path}.png`
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath)
          console.log('File renamed')
        } else {
          console.log('File not renamed')
        }
        return {
          title: file.originalname,
          fileName: newPath.replace(/public/gi, '')
        }
      })

      try {
        const insertedId = await adminHelpers.addBanner({ photos: photos })
        req.session.admin.loggedIn = true
        res.redirect('/admin/addBanner')
      } catch (error) {
        console.log(error)
        res.redirect('/admin/addBanner')
      }
    }
  })
}

AddBannerget = (req, res) => {
  res.render('admin/add-banner', { admin: true })
}

deletebannerget = (req, res) => {
  let bannerId = req.params.id
  adminHelpers.deleteBanner(bannerId).then(response => {
    res.redirect('/admin/banners')
  })
}
// banner mangement end//

//  coupon management //
viewCouponGet = (req, res) => {
  let admin = req.session.admin
  couponHelpers.getCoupons().then(response => {
    res.render('admin/view-coupon', { response, admin })
  })
}

addCouponGet = (req, res) => {
  let admin = req.session.admin
  res.render('admin/add-coupon', { admin })
}

addCouponPost = (req, res) => {
  req.body.couponCode = req.body.couponCode.toUpperCase()
  req.body.discount = parseInt(req.body.discount)
  req.body.maxPurchase = parseInt(req.body.maxPurchase)

  couponHelpers.addcoupon(req.body).then(response => {
    if (response) {
      // Coupon code added successfully
      res.json({ success: true, message: 'Coupon code added successfully.' })
    } else {
      // Coupon code already exists
      res.json({ success: false, message: 'Coupon code already exists.' })
    }
  })
}

editCouponGet = (req, res) => {
  let id = req.params.id

  couponHelpers.getOneCoupon(id).then(coupon => {
    res.render('admin/edit-coupon', { coupon, admin: true })
  })
}

editCouponPost = (req, res) => {
  let couponCode = req.body.couponCode.toUpperCase()
  let discount = parseInt(req.body.discount)
  let maxPurchase = parseFloat(req.body.maxPurchase)
  // let maxPurchase = parseFloat(req.body.maxUsage);
  console.log(discount)
  let id = req.body.id

  let data = {
    couponCode: couponCode,
    expiryDate: req.body.expiryDate,
    discount: discount,
    maxPurchase: maxPurchase
  }
  couponHelpers.editCoupon(id, data).then(response => {
    res.json({ response })
  })
}

deleteCouponPost = (req, res) => {
  let id = req.body.id
  console.log(req.body)
  couponHelpers.deleteCoupon(id).then(response => {
    res.json({ response })
  })
}

// coupon maagement end //
//error-page ////
errorpageget = (req, res) => {
  res.render('admin/error-page')
}
// error-page end ///

// sales report start ///
salesReport = async (req, res) => {
  filter = req.query.range
  const [
    latestorder,
    latestuser,
    totaluser,
    totalproduct,
    totalAmount,
    monthlydata,
    paymentCounts
  ] = await Promise.all([
    adminHelpers.getAllLatestOrders(),
    adminHelpers.getAllLatestUsers(),
    adminHelpers.totalUser(),
    adminHelpers.totalProduct(),
    adminHelpers.totalAmount(),
    adminHelpers.getSellingProductInEachMonth(),
    adminHelpers.paymentMethodCount()
  ])
  let sales
  let range
  let sumTotalAmount = 0
  if (filter == 'week') {
    sales = await adminHelpers.orderLastWeek()
    // date formate //
    sales.forEach(sale => {
      const dateParts = sale.date.toISOString().substring(0, 10).split('-')
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    })
    // date formate //
    sales.forEach(sale => {
      sumTotalAmount += sale.totalAmount
    })

    range = 'Week'
  } else if (filter == 'month') {
    sales = await adminHelpers.orderLastMonth()
    // date formate //
    sales.forEach(sale => {
      const dateParts = sale.date.toISOString().substring(0, 10).split('-')
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    })
    // date formate //
    sales.forEach(sale => {
      sumTotalAmount += sale.totalAmount
    })
    range = 'Month'
  } else {
    sales = await adminHelpers.orderLastYear()
    // date formate //
    sales.forEach(sale => {
      const dateParts = sale.date.toISOString().substring(0, 10).split('-')
      sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
    })
    // date formate //
    sales.forEach(sale => {
      sumTotalAmount += sale.totalAmount
    })
    range = 'Year'
  }

  res.render('admin/salesreport', {
    admin: true,
    latestorder,
    latestuser,
    totaluser,
    totalproduct,
    totalAmount,
    monthlydata,
    paymentCounts,
    sales,
    range,
    sumTotalAmount
  })
}

salesReports = async (req, res) => {
  let sales = await adminHelpers.orderLastWeek()
  sales.forEach(sale => {
    const dateParts = sale.date.toISOString().substring(0, 10).split('-')
    sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
  })
  res.render('admin/salesreport', { sales, admin: true })
}

async function dateFilterPost (req, res) {
  let startDate = req.body.startDate
  let endDate = req.body.endDate
  startDate = new Date(startDate)
  endDate = new Date(endDate)
  let sumTotalAmount = 0
  let sales = await adminHelpers.orderInDate(startDate, endDate)
  // date formate //
  sales.forEach(sale => {
    const dateParts = sale.date.toISOString().substring(0, 10).split('-')
    sale.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
  })
  // date formate //
  sales.forEach(sale => {
    sumTotalAmount += sale.totalAmount
  })
  res.render('admin/salesreport', { admin: true, sales, sumTotalAmount })
}

// sales report end//

module.exports = {
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
}
