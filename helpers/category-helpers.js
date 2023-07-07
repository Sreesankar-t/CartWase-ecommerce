let db=require('../config/connection')
let collection=require('../config/collections')
const { ObjectId } = require('mongodb')
var objectId=require('mongodb').ObjectId
module.exports={
    // addCategory:(category,callback)=>{
       
    //     db.get().collection('category').insertOne(category).then((data)=>{
         
    //       callback(data.insertedId)

    //     })

    //     },
        addCategory:(category)=>{
          return new Promise(async (resolve,reject)=>{
              let catExist = await db.get().collection(collection.CATE_COLLECTION).findOne({Category:category.Category})
           
              if(!catExist){
  
                  let data = await db.get().collection(collection.CATE_COLLECTION).insertOne(category)
                  console.log(data.Category)
                  resolve(data);
                  
              } else {
                  let data = false
                  resolve(data)
              }
          })
    
      },
        getAllCategory:()=>{
          return new Promise(async(resolve,reject)=>{
            let category= await db.get().collection(collection.CATE_COLLECTION).find().toArray()
            resolve(category)
          })
        },
        deleteCategory:(catId)=>{
          return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATE_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
              resolve(response)
            })
          })
        },
        getCategoryDetails:(catId)=>{
          return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATE_COLLECTION).findOne({_id:ObjectId(catId)}).then((category)=>{
              resolve(category)
            })
          })
        },
        // updateCategory:((catId,catDetails)=>{
        //   return new Promise((resolve,reject)=>{
        //     db.get().collection(collection.CATE_COLLECTION)
        //     .updateOne({_id:objectId(catId)},{

        //        $set:{
        //         No:catDetails.No,
        //         Name:catDetails.Name,
        //         Description:catDetails.Description,
        //         Category:catDetails.Category,
        //         Price:catDetails.Price
        //        }

        //     }).then((response)=>{
        //       resolve()
        //     })
        //   })
        // }),

        updateCategory:(cateId,cateDetails)=>{
          return new Promise(async (resolve,reject)=>{
              let catExist = await db.get().collection(collection.CATE_COLLECTION).findOne({Category:cateDetails.Category})
              if(!catExist){
                  db.get().collection(collection.CATE_COLLECTION).updateOne({_id:objectId(cateId)},{
                      $set:{
                         
                          // Name:cateDetails.Name,
                          // Description:cateDetails.Description,
                          // Price:cateDetails.Price,
                          Category:cateDetails.Category,
                          photos:cateDetails.photos
                      }
                  }).then((response)=>{
                    
                      resolve(response)
                  })
              } else {
                  let response = false;
                  resolve(response);
              }
             
                  
          })
      },

         
         

        hideCategory:(catId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.CATE_COLLECTION).updateOne({_id:objectId(catId)},{$set:{isHide:true}},(err,res)=>{
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
        unhideCategory:(catId)=>{
          return new Promise(async(resolve,reject)=>{
             await db.get().collection(collection.CATE_COLLECTION).updateOne({_id:objectId(catId)},{$set:{isHide:false}},(err,res)=>{
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
        getAllcategoryPagination:(val)=>{
          return new Promise(async(resolve,reject)=>{
            console.log(val)
            let category = await db.get()     
            .collection(collection.CATE_COLLECTION)
            .find()
            .skip((val - 1)*10)
            .limit(10)
            .toArray()
            resolve(category)
          })
        },


}