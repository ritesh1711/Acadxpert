
const mongoose = require('mongoose');


const mongoURI = process.env.MONGO_URI ;


mongoose.connect(mongoURI)
    .then(()=>{
        console.log("db connected")
    }).catch((err)=>{
        console.log("mongodb connection error : " , err)
    })