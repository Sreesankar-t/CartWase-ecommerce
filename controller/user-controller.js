const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers')
const couponHelpers = require('../helpers/coupon-helpers')
const categoryHelpers = require('../helpers/category-helpers')
const otpGenerator = require('otp-generator')
const nodemailer = require('nodemailer')
const alert = require('alert')
const { response, router, render } = require('../app')
const dotenv = require('dotenv')
dotenv.config()

let otp

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
})

async function homepageget (req, res) {
  const user = req.session.user
  console.log(user)
  let cartCount = null
  let banners = await adminHelpers.getBanners()
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getLatestProducts().then(products => {
    categoryHelpers.getAllCategory().then(category => {
      res.render('user/view-products', {
        products,
        category,
        user,
        guest: true,
        cartCount,
        banners
      })
    })
  })
}

function userhomepagepost (req, res, next) {
  const user = req.session.user
  let searchq = String(req.body.search)
  productHelpers
    .searchProducts(searchq)
    .then(products => {
      res.render('user/view-products', { products, user: true })
    })
    .catch(err => {
      console.log(err)
      res.redirect('/error-page')
    })
}

loginget = (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', {
      loginError: req.session.loginError,
      blockError: req.session.blockError,
      user: true
    })
    req.session.loginError = false
    req.session.blockError = false
  }
}
forgotPasswordget = (req, res) => {
  res.render('user/forgot-p')
}
async function forgotPost (req, res) {
  try {
    const { email, newPass } = req.body
    const user = await userHelpers.getUserByEmail(email)
    if (!user) {
      throw new Error('user not found')
    }
    await userHelpers.doUpdatePassword(user._id.toString(), newPass)
    res.redirect('/login')
  } catch (error) {
    console.log(error)
    res.render('user/forgot-p', { loginErr: error.message })
  }
}

signupget = (req, res) => {
  res.render('user/signup', { loginError: req.session.loginError })
  req.session.loginError = false
}

signuppost = (req, res) => {
  userHelpers.doSignup(req.body).then(response => {
    if (response == 1) {
      req.session.loginError = 'Email already used'
      res.redirect('/signup')
    }
    if (response != 1) {
      const { name, Email, password } = req.body
      let userDetails = req.body
      req.session.userDetails = req.body
      console.log(userDetails)

      otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false
      })

      const mailOptions = {
        from: process.env.EMAIL,
        to: Email,
        subject: 'OTP for sign up',
        text: ` Your OTP is ${otp}`
      }

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err)
          res.status(500).send({ message: 'Error sending OTP email' })
          client.close()
          return
        }
      })

      // Set a timeout of 60 seconds
      setTimeout(() => {
        otp = null
        console.log('otp expired')
      }, 60000)

      res.render('user/otp', { userDetails, otp })
    }
  })
}

otppost = async (req, res) => {
  if (otp == req.body.otp) {
    const { Name, Email, Password, ConformPassword } = req.session.userDetails

    await userHelpers.doSignUpSuccess({
      Name: Name,
      Email: Email,
      Password: Password,
      ConformPassword: ConformPassword
    })
    res.redirect('/login')
    alert('account created')
  } else {
    alert('wrong otp')
    res.redirect('/signup')
  }
}

loginpost = (req, res) => {
  userHelpers.doLogin(req.body).then(response => {
    if (response.status) {
      req.session.user = response.user
      req.session.user.loggedIn = true
      res.redirect('/')
    } else if (response == 1) {
      req.session.blockError = '! you are blocked !'
      res.redirect('/login')
    } else {
      req.session.loginError = '! invalid username or password !'
      res.redirect('/login')
    }
  })
}

logoutget = (req, res) => {
  req.session.destroy()
  res.redirect('/login')
}

addtocartget = (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect('/login')
  }
}

productDetailsget = async (req, res) => {
  const product = await productHelpers.getProductDetails(req.params.id)
  const user = req.session.user
  console.log(product)
  res.render('user/product-details.hbs', {
    product,
    user: true,
    guest: true,
    user
  })
}

async function allproductsget (req, res, next) {
  const user = req.session.user
  const filter = req.query.category
  const sort = req.query.sort // Retrieve the sort parameter
  let val = Number(req.query.p)
  let filterbyCategory
  let category

  if (filter == 'Gamming') {
    filterbyCategory = await productHelpers.getGamingProducts(sort) // Pass the sort parameter to the helper function
    category = 'Gamming'
  } else if (filter == 'Ultrabook') {
    filterbyCategory = await productHelpers.getUlrabookProducts(sort) // Pass the sort parameter to the helper function
    category = 'Ultrabook'
  } else if (filter == '2 In 1 Laptops') {
    filterbyCategory = await productHelpers.getTwoinOneProducts(sort) // Pass the sort parameter to the helper function
    category = '2 In 1 Laptops'
  } else {
    filterbyCategory = await productHelpers.getStudentandBusinessProducts(sort) // Pass the sort parameter to the helper function
    category = 'Student & Business'
  }

  if (filter) {
    res.render('user/allproducts', {
      products: filterbyCategory,
      user,
      guest: true,
      filterbyCategory,
      category
    })
  } else {
    productHelpers
      .getAllProductsPagination(val)
      .then(products => {
        res.render('user/allproducts', {
          products,
          user,
          guest: true,
          filterbyCategory,
          category
        })
      })
      .catch(error => {
        // Handle error
      })
  }
}

function allproductspost (req, res, next) {
  const user = req.session.user
  let search = String(req.body.search)
  let searchq = search
  productHelpers
    .searchProducts(searchq)
    .then(products => {
      res.render('user/allproducts', { products, user: true })
    })
    .catch(err => {
      console.log(err)
      res.redirect('/error-page')
    })
}

async function cartget (req, res) {
  let userId = req.session.user._id
  //  let user= await userHelpers.userDetails(userId)
  // let products=await userHelpers.getCartProducts(user._id)
  const [user, products] = await Promise.all([
    userHelpers.userDetails(userId),
    userHelpers.getCartProducts(userId)
  ])
  if (products.length) {
    let total = await userHelpers.getTotalAmount(user._id)

    res.render('user/cart', { products, user, total })
  } else {
    req.session.cartEmpty = 'Your cart is empty !!'
    let emptyError = req.session.cartEmpty
    res.render('user/cart', { user: req.session.user, emptyError })
  }
}
// cart ajax controller//

cartaddtocartget = (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
}

changeProductQuantitypost = (req, res, next) => {
  console.log(req.body)

  userHelpers.changeProductQuantity(req.body).then(async response => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
}
removeFromCartpost = (req, res, next) => {
  userHelpers.removeFromCart(req.body).then(response => {
    res.json(response)
  })
}

placeorderget = async (req, res) => {
  try {
    const userId = req.session.user._id
    const [user, userAddresses, total] = await Promise.all([
      userHelpers.getUser(userId),
      userHelpers.getUserAddress(userId),
      userHelpers.getTotalAmount(userId)
    ])

    req.session.usedCoupon = null
    req.session.user.pAmount = total

    res.render('user/place-order', { user, userAddresses, total })
  } catch (error) {
    // Handle and respond to the error
    res.status(500).json({ error: 'Something went wrong' })
  }
}

placeorderpost = async (req, res) => {
  console.log(req.body)

  userId = req.session.user._id
  let test = req.session.user.pAmount
  let walletAmout = 0
  let amount = await couponHelpers.getCouponAmount(req.session.usedCoupon)
  if (req.session.walletApply) {
    walletAmout = await couponHelpers.getWalletAmount(userId)
  }
  let products = await userHelpers.getProductsList(req.body.userId)

  req.body.amount = amount
  req.body.walletAmout = walletAmout
  let total = req.session.user.pAmount
  order = await userHelpers.placeOrder(req.body, products, total)
  req.session.orderId = order
  if (req.body['payment-method'] == 'COD') {
    await userHelpers.cartDelete(req.session.user._id)
    res.json({ codSuccess: true })
  } else {
    userHelpers.generateRazorpay(order, total).then(response => {
      res.json(response)
    })
  }
}

ordersuccessget = async (req, res) => {
  let user = req.session.user
  let price = req.session.user.pAmount
  let amount = req.session.user.walletBalance

  let id = req.session.orderId

  if (req.session.walletApply) {
    console.log(amount)
    userHelpers.decrementAmountWallet(amount, user._id)
    req.session.walletApply = false
    req.session.walletBalance = 0
  }
  if (req.session.usedCoupon) {
    let user = req.session.user
    let usedCoupon = req.session.usedCoupon
    userHelpers.deleteCoupon(user._id, usedCoupon)
    req.session.usedCoupon = null
    req.session.couponDiscount = false
  }

  let coupon = await couponHelpers.giveCoupon(price)
  if (coupon) {
    let userId = user._id
    userHelpers.addCouponUser(userId, coupon)
  }
  req.session.user.pAmount = 0
  let order = await userHelpers.getOrder(id)

  req.session.orderId = null
  res.render('user/order-success', { user, coupon, order })
}

orderSummaryget = async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  //date formating//
  orders.forEach(order => {
    const dateParts = order.date.toISOString().substring(0, 10).split('-')
    order.date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`
  })
  //date formating//
  res.render('user/order-summary', { user: req.session.user, orders })
}

viewOrderProducts = async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  let orders = await userHelpers.getOrder(req.params.id)
  res.render('user/view-order-products', {
    user: req.session.user,
    products,
    orders
  })
}

async function cancelorder (req, res) {
  let id = req.query.id
  let status = req.query.st
  let userId = req.session.user._id
  await userHelpers.cancelOrder(id, status)
  let order = await userHelpers.getOrder(id)
  let amount = order.totalAmount
  if (order.paymentMethod == 'ONLINE') {
    userHelpers.addAmountWallet(amount, userId)
  }

  res.redirect('/order-summary')
}

async function useExist (req, res) {
  let Id = req.query.id
  let userId = req.session.user._id
  const [user, userAddresses, userAddress, total] = await Promise.all([
    userHelpers.getUser(userId),
    userHelpers.getUserAddress(userId),
    userHelpers.getOneAddress(Id),
    userHelpers.getTotalAmount(userId)
  ])
  req.session.usedCoupon = null
  res.render('user/place-order', { userAddress, user, total, userAddresses })
}

function addNewAddressPost (req, res) {
  let userId = req.body.userId
  let addressobj = {
    name: req.body.firstname,
    address: req.body.address,
    pincode: req.body.pincode,
    phone: req.body.phone
  }
  userHelpers.addNewAddress(userId, addressobj).then(() => {
    res.redirect('/place-order')
  })
}

// user profile management//

userprofileget = async (req, res) => {
  let user = req.session.user
  let userAddresses = await userHelpers.getUserAddress(user._id)
  res.render('user/user-profile', { user, userAddresses })
}

userprofilepost = (req, res) => {
  let userId = req.body.userId
  let addressobj = {
    name: req.body.firstname,
    address: req.body.address,
    pincode: req.body.pincode,
    phone: req.body.phone
  }
  userHelpers.addNewAddress(userId, addressobj).then(() => {
    res.redirect('/user-profile')
  })
}

edituseraddress = async (req, res) => {
  let user = req.session.user
  let addressId = req.query.id
  let Address = await userHelpers.getOneAddress(addressId)

  res.render('user/edit-address', { Address, user })
}

edituseraddresspost = (req, res) => {
  let Id = req.query.id
  let addressobj = {
    name: req.body.firstname,
    address: req.body.address,
    pincode: req.body.pincode,
    phone: req.body.phone
  }
  userHelpers.editAddress(Id, addressobj)
  res.redirect('/user-profile')
}

deleteAddressget = (req, res) => {
  let Id = req.query.id

  userHelpers.deleteAddress(Id)
  res.redirect('/user-profile')
}

deleteuserAddressget = (req, res) => {
  let Id = req.query.id
  userHelpers.deleteAddress(Id)
  res.redirect('/place-order')
}

//online payment start//

verifyPaymentpost = (req, res) => {
  console.log(req.body)
  let total = req.session.user.pAmount
  userHelpers
    .verifyPayment(req.body)
    .then(async () => {
      products = await userHelpers.getProductsList(req.session.user._id)
      await userHelpers.cartDelete(req.session.user._id)
      console.log(products)
      order = await userHelpers.placeOrder(req.body, products, total)
      res.json({ status: true })
    })
    .catch(err => {
      console.log(err)
      res.json({ status: false, errMsg: '' })
    })
}

//online payment end//

//error-page //
function errorpageget (req, res) {
  res.render('user/error-page', { user: true })
}
//error-page end //

// coupon management //
async function applyCouponPost (req, res) {
  let couponCode = req.body.coupon
  console.log(couponCode)
  const currDate = new Date()
  let userCoupon = await couponHelpers.applyCoupon(couponCode)
  if (userCoupon && !req.session.usedCoupon) {
    let endDate = new Date(userCoupon.expiryDate)
    if (endDate > currDate) {
      let total = req.session.user.pAmount
      let response = {}
      req.session.usedCoupon = userCoupon.couponCode
      req.session.usedCoupon.amount = userCoupon.discount
      response.response = true
      response.discountAmount = userCoupon.discount
      response.newTotal = total - userCoupon.discount
      req.session.user.pAmount = total - userCoupon.discount
      res.json(response)
    } else {
      res.json({ response: false })
    }
  } else {
    res.json({ response: false })
  }
}
// coupon management end //

// product return adn wallet ///

returnOrder = async (req, res) => {
  let id = req.query.id
  let status = req.query.st
  let userId = req.session.user._id
  userHelpers.cancelOrder(id, status)

  let order = await userHelpers.getOrder(id)
  let amount = order.totalAmount
  userHelpers.addAmountWallet(amount, userId)

  res.redirect('/order-summary')
}

useWalletPost = async (req, res) => {
  let wallet = req.body.wallet
  let Amount = req.session.user.pAmount
  let balance
  let walletBalance
  if (wallet > Amount) {
    balance = 0
    walletBalance = Math.abs(Amount - wallet)
  } else {
    balance = Math.abs(Amount - wallet)
    walletBalance = 0
  }
  req.session.user.pAmount = balance
  req.session.user.walletBalance = walletBalance
  req.session.walletApply = true

  let response = {}
  response.total = balance
  req.session.user.pAmount = balance
  response.walletBalance = walletBalance
  res.json(response)
}

walletget = async (req, res) => {
  let userId = req.session.user._id
  let user = await userHelpers.getUser(userId)
  res.render('user/wallet', { user })
}
// product return and wallet  end //

// wishlist start //

async function userWhishlist (req, res) {
  let userId = req.session.user._id
  let user = await userHelpers.getUser(userId)
  let list = await userHelpers.getWishlistProducts(userId)

  if (list && list.products.length > 0) {
    res.render('user/wishlist', { list, user })
  } else {
    req.session.cartEmpty = 'Your wishlist is empty'
    let emptyError = req.session.cartEmpty
    res.render('user/wishlist', { user: req.session.user, emptyError })
  }
}

function addWhishlist (req, res) {
  console.log('api call')
  userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
}

function removeWhishlist (req, res) {
  userHelpers.removeFromwishlist(req.body).then(response => {
    res.json(response)
  })
}
// wishlist end //

module.exports = {
  homepageget,
  loginget,
  signupget,
  signuppost,
  otppost,
  loginpost,
  logoutget,
  forgotPasswordget,
  addtocartget,
  productDetailsget,
  allproductsget,
  cartget,
  cartaddtocartget,
  changeProductQuantitypost,
  removeFromCartpost,
  placeorderget,
  placeorderpost,
  ordersuccessget,
  orderSummaryget,
  viewOrderProducts,
  cancelorder,
  addNewAddressPost,
  useExist,
  userprofileget,
  userprofilepost,
  edituseraddress,
  edituseraddresspost,
  deleteAddressget,
  deleteuserAddressget,
  verifyPaymentpost,
  userhomepagepost,
  errorpageget,
  allproductspost,
  applyCouponPost,
  returnOrder,
  useWalletPost,
  addWhishlist,
  removeWhishlist,
  userWhishlist,
  walletget,
  forgotPost
}
