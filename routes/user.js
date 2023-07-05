const express = require('express');
const router = express.Router();
const { verifyLogin,errorHandler} = require('../helpers/middleware');

const{homepageget,loginget,signupget,signuppost,otppost,loginpost,
       logoutget,addtocartget,productDetailsget,allproductsget,cartaddtocartget,
       changeProductQuantitypost,removeFromCartpost,placeorderget,placeorderpost,
       ordersuccessget,cartget,orderSummaryget,viewOrderProducts,cancelorder,
       useExist,addNewAddressPost,userprofileget,userprofilepost,edituseraddress,
       edituseraddresspost,deleteAddressget,deleteuserAddressget,verifyPaymentpost,
       userhomepagepost,errorpageget,allproductspost,applyCouponPost,returnOrder,
       useWalletPost,userWhishlist,addWhishlist,removeWhishlist,
        walletget,forgotPasswordget,forgotPost}=require('../controller/user-controller')




 
/* GET home page. */
router.get('/',homepageget);

router.post('/',verifyLogin,userhomepagepost);


router.get('/login',loginget);


router.get("/updatePass", forgotPasswordget);
//forgot password post method//
router.post('/updatePass',forgotPost)


router.get('/signup',signupget );


router.post("/signup",signuppost );


router.post("/otp", otppost);


router.post('/login',loginpost);


router.get('/logout',logoutget );

router.get('/add to cart', addtocartget);


router.get('/productdetails/:id',productDetailsget );


router.get('/allproducts',allproductsget);
router.post('/allproducts',allproductspost);



//cart management routes start//

router.get('/cart',verifyLogin,cartget)

// cart ajax routs start//

router.get('/add-to-cart/:id',verifyLogin,cartaddtocartget)

router.post('/change-product-quantity',verifyLogin,changeProductQuantitypost)

router.post('/remove-from-cart',removeFromCartpost)


// cart ajax routes end//
//cart management routes start//

router.get('/place-order',verifyLogin,placeorderget)


router.post('/place-order',verifyLogin,placeorderpost)

router.get('/order-success',verifyLogin,ordersuccessget)

router.get('/order-summary',verifyLogin,orderSummaryget)

router.get('/view-order-products/:id',verifyLogin,viewOrderProducts)

router.get('/cancel-order',verifyLogin,cancelorder)


router.get('/use_address',useExist)
router.post('/add-new-address',addNewAddressPost)
router.get('/delete-address',deleteuserAddressget)

//user profile management start//
router.get('/user-profile',verifyLogin,userprofileget )
router.post('/add-new-address-profile',userprofilepost)

router.get('/edit-address',verifyLogin, edituseraddress)

router.post('/edit-address',edituseraddresspost)

router.get('/delete-address',deleteAddressget)
//user profile management end //

//online payment start//

router.post('/verify-payment',verifyPaymentpost)
//online payment  end//

// error page start//

router.get('/error-page' ,errorpageget)
// error page end //

// coupon start //
router.post('/apply-coupon',verifyLogin,applyCouponPost)
// coupon end //

router.get('/wallet',verifyLogin,walletget)
// product return and wallet////

router.get('/return-order',verifyLogin,returnOrder)

router.post('/use-wallet',verifyLogin,useWalletPost)
// product return and wallet end //

// wishlist start //
router.get('/wishlist',verifyLogin,userWhishlist)

router.get('/add-to-Wishlist/:id',verifyLogin,addWhishlist)

router.post('/remove-from-wishlist',verifyLogin,removeWhishlist)
// wishlist end //


module.exports = router;

