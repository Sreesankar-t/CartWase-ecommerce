let db = require('../config/connection')
let collection = require('../config/collections')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId
const { ObjectId } = require('mongodb')
const moment = require('moment')

module.exports = {
  doLogin: adminData => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false
      let response = {}
      console.log(adminData)
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ Email: adminData.Email })
      console.log(admin)
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then(status => {
          if (status) {
            console.log('login success')
            response.admin = admin
            response.status = true
            resolve(response)
          } else {
            console.log('login failed')
            resolve({ status: false })
          }
        })
      } else {
        console.log('login failed')
        resolve({ status: false })
      }
    })
  },
  getAllUsers: user => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({})
        .toArray()
      resolve(users)
    })
  },
  blockUser: userId => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $set: { isBlocked: true } },
          (err, res) => {
            if (err) {
              console.log('error :' + err)
              res.status(500).send('Error blocking')
            } else {
              console.log('User Blocked')
              resolve('success')
            }
          }
        )
    })
  },
  unBlockUser: userId => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          { $set: { isBlocked: false } },
          (err, res) => {
            if (err) {
              console.log('error :' + err)
              res.status(500).send('Error blocking')
            } else {
              console.log('User Unblocked')
              resolve('success')
            }
          }
        )
    })
  },
  getAlluserPagination: val => {
    return new Promise(async (resolve, reject) => {
      console.log(val)
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .skip((val - 1) * 10)
        .limit(10)
        .toArray()
      resolve(users)
    })
  },
  getAlluserOrderPagination: val => {
    return new Promise(async (resolve, reject) => {
      console.log(val)
      let usersOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ _id: -1 }) // Sort in descending order based on _id field
        .skip((val - 1) * 10)
        .limit(10)
        .toArray()
      resolve(usersOrders)
    })
  },

  getAllUsersOrders: () => {
    return new Promise(async (resolve, reject) => {
      let usersOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .toArray()

      resolve(usersOrders)
    })
  },
  delivered: async orderId => {
    await new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          { $set: { status: 'Delivered' } }
        )
    })
    resolve()
  },
  cancelOrder: (orderId, status) => {
    new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne({ _id: objectId(orderId) }, { $set: { status: status } })
      resolve()
    })
  },

  addBanner: banner => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = await db
          .get()
          .collection(collection.BANNER_COLLECTION)
          .insertOne(banner)
        resolve(data.insertedId.toString())
      } catch (error) {
        reject(error)
      }
    })
  },

  getBanners: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let banners = await db
          .get()
          .collection(collection.BANNER_COLLECTION)
          .find()
          .toArray()

        resolve(banners)
        console.log(banners)
      } catch (error) {
        reject(error)
      }
    })
  },

  deleteBanner: bannerId => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.BANNER_COLLECTION)
        .deleteOne({ _id: ObjectId(bannerId) })
        .then(response => {
          resolve(response)
        })
    })
  },

  // dashbord mnagement  start//
  getAllLatestOrders: () => {
    return new Promise(async (resolve, reject) => {
      let usersOrders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({})
        .sort({ _id: -1 }) // Sort by descending order of _id (assuming _id represents the order creation timestamp)
        .limit(5) // Limit the result to 5 documents
        .toArray()

      resolve(usersOrders)
    })
  },

  getAllLatestUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({})
        .sort({ _id: -1 }) // Sort by descending order of _id (assuming _id represents the user creation timestamp)
        .limit(5) // Limit the result to 5 documents
        .toArray()

      resolve(users)
    })
  },

  totalUser: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .countDocuments({}, (err, count) => {
          if (err) {
            reject(err)
          }
          // Access the total count of products
          resolve(count)
        })
    })
  },

  totalProduct: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .countDocuments({}, (err, count) => {
          if (err) {
            reject(err)
          }
          // Access the total count of products
          resolve(count)
        })
    })
  },

  totalAmount: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 }
            }
          }
        ])
        .toArray((err, result) => {
          if (err) {
            reject(err)
          }
          // Access the total amount and total orders from the result
          const totalAmount = result[0].totalAmount
          const totalOrders = result[0].totalOrders
          resolve({ totalAmount, totalOrders })
        })
    })
  },

  getSellingProductInEachMonth: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: { $month: { $toDate: '$date' } },
              totalAmount: { $sum: '$totalAmount' }
            }
          },
          {
            $project: {
              month: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$_id', 1] }, then: 'January' },
                    { case: { $eq: ['$_id', 2] }, then: 'February' },
                    { case: { $eq: ['$_id', 3] }, then: 'March' },
                    { case: { $eq: ['$_id', 4] }, then: 'April' },
                    { case: { $eq: ['$_id', 5] }, then: 'May' },
                    { case: { $eq: ['$_id', 6] }, then: 'June' },
                    { case: { $eq: ['$_id', 7] }, then: 'July' },
                    { case: { $eq: ['$_id', 8] }, then: 'August' },
                    { case: { $eq: ['$_id', 9] }, then: 'September' },
                    { case: { $eq: ['$_id', 10] }, then: 'October' },
                    { case: { $eq: ['$_id', 11] }, then: 'November' },
                    { case: { $eq: ['$_id', 12] }, then: 'December' }
                  ],
                  default: 'Unknown'
                }
              },
              totalAmount: 1
            }
          },
          {
            $sort: { _id: 1 } // Sort by month in ascending order
          }
        ])
        .toArray((err, result) => {
          if (err) {
            console.error(err)
            reject(err)
            return
          }

          const amounts = result.map(item => item.totalAmount)
          const month = result.map(item => item.month)
          console.log('helper contetent')
          console.log(amounts)
          console.log(month)

          const data = {
            month: month,
            amounts: amounts
          }

          resolve(data)
        })
    })
  },

  getSellingProductInEachMonth1: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: { $month: { $toDate: '$date' } },
              totalAmount: { $sum: '$totalAmount' }
            }
          }
        ])
        .toArray((err, result) => {
          if (err) {
            // Handle the error
            console.error(err)
            return
          }

          resolve(result)
        })
    })
  },

  paymentMethodCount: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const codCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({ paymentMethod: 'COD' })

        const onlineCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .countDocuments({ paymentMethod: 'ONLINE' })

        resolve({ codCount, onlineCount })
      } catch (error) {
        reject(error)
      }
    })
  },

  totalAmount: () => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$totalAmount' },
              totalOrders: { $sum: 1 }
            }
          }
        ])
        .toArray((err, result) => {
          if (err) {
            reject(err)
          }
          // Access the total amount and total orders from the result
          const totalAmount = result[0].totalAmount
          const totalOrders = result[0].totalOrders
          resolve({ totalAmount, totalOrders })
        })
    })
  },
  orderLastWeek: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(7, 'days').startOf('day').toDate()
      const endDate = moment().endOf('day').toDate()

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: 'Delivered',
                date: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            }
          ])
          .toArray()
        resolve(orderCount)
      } catch (error) {
        reject(error)
      }
    })
  },
  // orderLastWeek: () => {
  //   return new Promise(async (resolve, reject) => {
  //     const startDate = moment().subtract(7, "days").startOf("day").toDate();
  //     const endDate = moment().endOf("day").toDate();

  //     try {
  //       const orders = await db
  //         .get()
  //         .collection(collection.ORDER_COLLECTION)
  //         .aggregate([
  //           {
  //             $match: {
  //               status: "Delivered",
  //               date: {
  //                 $gte: startDate,
  //                 $lte: endDate,
  //               },
  //             },
  //           },
  //         ]).toArray();

  //       const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  //       orderCount={
  //         order:orders,
  //         grantTotal:totalAmount

  //       }
  //       resolve(orderCount);
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // },

  orderLastMonth: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(30, 'days').startOf('day').toDate()
      const endDate = moment().endOf('day').toDate()

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: 'Delivered',
                date: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            }
          ])
          .toArray()
        resolve(orderCount)
      } catch (error) {
        reject(error)
      }
    })
  },
  orderLastYear: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = moment().subtract(365, 'days').startOf('day').toDate()
      const endDate = moment().endOf('day').toDate()

      try {
        const orderCount = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: 'Delivered',
                date: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            }
          ])
          .toArray()
        resolve(orderCount)
      } catch (error) {
        reject(error)
      }
    })
  },

  // date filter
  orderInDate: (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      try {
        const orders = await db
          .get()
          .collection(collection.ORDER_COLLECTION)
          .aggregate([
            {
              $match: {
                status: 'Delivered',
                date: {
                  $gte: startDate,
                  $lte: endDate
                }
              }
            }
          ])
          .toArray()
        resolve(orders)
      } catch (error) {
        reject(error)
      }
    })
  }
  // sales report end //
}
