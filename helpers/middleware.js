const userHelpers = require('../helpers/user-helpers')

const multer = require('multer')
const path = require('path')

verifyLogin = async (req, res, next) => {
  if (req.session.user && req.session.user.loggedIn) {
    let blocked = await userHelpers.userDetails(req.session.user._id)

    if (blocked.isBlocked == true) {
      res.redirect('/login')
    } else {
      next()
    }
  } else {
    res.redirect('/login')
  }
}

verifyLoginadmin = (req, res, next) => {
  if (req.session.admin && req.session.admin.loggedIn) {
    next()
  } else {
    res.redirect('/admin/adminLogin')
  }
}

const upload = multer({
  dest: 'public/images',
  limits: {
    fieldSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExtensions.includes(ext)) {
      const originalExt = path.extname(file.originalname).toLowerCase()
      if (originalExt === ext) {
        cb(null, true) // Accept the file
      } else {
        cb(new Error('Invalid file extension.'), false) // Reject the file
      }
    } else {
      cb(new Error('Only image files are allowed.'), false) // Reject the file
    }
  }
})

const errorHandler = (err, req, res, next) => {
  // Handle the error
  console.error(err)

  const statusCode = err.status || 500 // Extract the status code or use 500 as the default

  if (statusCode === 404) {
    // Render the error page
    res.status(statusCode).render('error-page') // Assuming 'error-page' is the name of your error page view
  } else {
    // Continue with the next middleware
    next(err)
  }
}

module.exports = { verifyLogin, verifyLoginadmin, upload, errorHandler }
