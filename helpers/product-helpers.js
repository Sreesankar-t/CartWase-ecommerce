var db=require('../config/connection')
var collection=require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectId
module.exports={
    // addProduct:(product,callback)=>{
       
    //     db.get().collection('product').insertOne(product).then((data)=>{
         
    //       callback(data.insertedId)

    //     })

    //     },
    //     getAllProducts:()=>{
    //       return new Promise(async(resolve,reject)=>{
    //         let products= await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    //         resolve(products)
    //       })
    //     },
    addProduct: (product, callback) => {
     
      db.get()
        .collection("product")
        .insertOne(product)
        .then((data) => {
          console.log("this is the id :" + data.insertedId);
          callback(data.insertedId);
  });
  },
        getProductDetails:(proId)=>{
          return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(proId)}).then((product)=>{
              resolve(product)
            })
          })
        },
        updateProduct:((proId,proDetails)=>{
          return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{

               $set:{
                No:proDetails.No,
                Name:proDetails.Name,
                Description:proDetails.Description,
                Category:proDetails.Category,
                Price:proDetails.Price,
                photos:proDetails.photos
               }

            }).then((response)=>{
              resolve()
            })
          })
        }),
        hideproduct:(proId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection. PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{isHide:true}},(err,res)=>{
              if(err){
                console.log("error :"+err)
                res.status(500).send("Error hide")
            }else{
                console.log(' hide')
                resolve("success")
            }
            })
          })
        },
        unhideproduct:(proId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{$set:{isHide:false}},(err,res)=>{
              if(err){
                console.log("error :"+err)
                res.status(500).send("Error hide")
            }else{
                console.log('unhide')
                resolve("success")
            }
            })
          })
        },
        getAllProductsPagination:(val)=>{
          return new Promise(async(resolve,reject)=>{
            console.log(val)
            let products = await db.get()
            .collection(collection.PRODUCT_COLLECTION)
            .find()
            .skip((val - 1)*8)
            .limit(8)
            .toArray()
            resolve(products)
          })
        },
        getLatestProducts:()=>{
          return new Promise(async(resolve,reject)=>{
              let ltstProducts = await db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .find()
              .sort({_id: -1})  //Sort by _id field in descending order
              .limit(4)   // Limit the result to 8 documents
              .toArray();
              resolve(ltstProducts) 
          })
        },
        searchProducts:(search)=>{
          return new Promise(async (resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION)
            .find(   {$or: [
              { Category: { $regex: new RegExp('^' + search + '.*', 'i') } },
              { Name: { $regex: new RegExp('^' + search + '.*', 'i') } },
              { Price: { $regex: new RegExp('^' + search + '.*', 'i') } },
              // Add more fields as needed
            ]})
            .toArray()
            if(products.length){
              resolve(products)
              console.log(products)
            } else {
              let sErr = "No such item found" 
              reject(sErr)
            }
           
          })
        },
        searchuser: (search) => {
          return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION)
              .find({ Name: { $regex: new RegExp('^' + search + '.*', 'i') } })
              .toArray();
        
            if (users.length) {
              resolve(users);
              console.log(users);
            } else {
              let sErr = "No users found";
              reject(sErr);
            }
          });
        },
        searchUserOrder: (search) => {
          return new Promise(async (resolve, reject) => {
            let usersOrders = await db.get().collection(collection.ORDER_COLLECTION)
           
            .find(   {$or: [
              { 'deliveryDetails.address': { $regex: new RegExp('^' + search + '.*', 'i') } },
              { status: { $regex: new RegExp('^' + search + '.*', 'i') } },
              { paymentMethod: { $regex: new RegExp('^' + search + '.*', 'i') } },
              // Add more fields as needed
            ]})
              .toArray();
        
            if (usersOrders.length) {
              resolve(usersOrders);
              console.log(usersOrders);
            } else {
              let sErr = "No user orders found";
              reject(sErr);
            }
          });
        },
        
        getGamingProducts: (sortOrder) => {
          return new Promise((resolve, reject) => {
            const sortOptions = {};
            if (sortOrder === 'asc') {
              sortOptions.Price = 1; // Sort in ascending order of price
            } else if (sortOrder === 'desc') {
              sortOptions.Price = -1; // Sort in descending order of price
            }
        
            db.get()
              .collection(collection.PRODUCT_COLLECTION)
              .find({ Category: 'Gamming' })
              .sort(sortOptions)
              .toArray()
              .then((products) => {
                resolve(products);
              })
              .catch((error) => {
                reject(error);
              });
          });
        },
        
        getUlrabookProducts:(sortOrder)=>{
          return new Promise ((resolve,reject)=>{
            const sortOptions = {};
            if (sortOrder === 'asc') {
              sortOptions.Price = 1; // Sort in ascending order of price
            } else if (sortOrder === 'desc') {
              sortOptions.Price = -1; // Sort in descending order of price
            }
            db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Ultrabook"}).sort(sortOptions).toArray().then((products)=>{
              resolve(products);
            })
            .catch((error)=>{
              reject(error)
            })
          })
        },
        getStudentandBusinessProducts:(sortOrder)=>{
          return new Promise ((resolve,reject)=>{
            const sortOptions = {};
            if (sortOrder === 'asc') {
              sortOptions.Price = 1; // Sort in ascending order of price
            } else if (sortOrder === 'desc') {
              sortOptions.Price = -1; // Sort in descending order of price
            }
            db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"Student & Business"}).sort(sortOptions).toArray().then((products)=>{
              resolve(products);
            })
            .catch((error)=>{
              reject(error)
            })
          })
        },
        getTwoinOneProducts:(sortOrder)=>{
          return new Promise ((resolve,reject)=>{
            const sortOptions = {};
            if (sortOrder === 'asc') {
              sortOptions.Price = 1; // Sort in ascending order of price
            } else if (sortOrder === 'desc') {
              sortOptions.Price = -1; // Sort in descending order of price
            }
            db.get().collection(collection.PRODUCT_COLLECTION).find({Category:"2 In 1 Laptops"}).sort(sortOptions).toArray().then((products)=>{
              resolve(products);
            })
            .catch((error)=>{
              reject(error)
            })
          })
        },
        
        
    }
   