const mongoose = require('mongoose')

const connect = () =>{
    mongoose.connect(process.env.MONGO_URL,(err) =>{
        if(err) throw err;
        console.log("Database connect successfully");
    })
}

module.exports = connect