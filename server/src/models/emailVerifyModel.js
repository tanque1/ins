const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const emailSchema = new mongoose.Schema({
    owner:{type: mongoose.Types.ObjectId, ref: 'User'},
    token:{type:String,require:true},
    createdAt:{type:Date, default: Date.now(),expires: 3600 }
})


emailSchema.pre('save',async function(){
    if(this.isModified('token')){
        this.token = await bcrypt.hash(this.token,12);
    }
})

emailSchema.methods.compareToken = async function(token)  {
    return await bcrypt.compare(token,this.token)
}

module.exports = mongoose.model("EmailVerificationToken",emailSchema)