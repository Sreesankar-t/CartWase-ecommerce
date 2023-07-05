const mongoClient=require('mongodb').MongoClient
 const state={
    db:null
 }
module.exports.connect=(done)=>{
   //  const url='mongodb://127.0.0.1:27017/:27017'
       const url='mongodb+srv://sreeshankerthekkan:sreesankar@cluster0.iephdag.mongodb.net/'
    const dbname='shopping'

    mongoClient.connect(url,(err,data)=>{
        if(err)  return done(err)
        state.db=data.db(dbname)
         done()
    })


    
}
 module.exports.get=()=>{
    return state.db
 }