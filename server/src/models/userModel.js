const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    userName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 25,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    gender: { type: String, default: "Nam" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    story: {
      type: String,
      default: "",
      maxlength: 200,
    },
    website: { type: String, default: "" },
    followers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    avatar: {
      url:{type:String,default: "https://res.cloudinary.com/dtvwgsmrq/image/upload/v1656036453/samples/profilePic_gie4aj.png"},
      public_id:{type:String,default: ""}
    },
    isVerify: {type:Boolean,default:false}
  },
  {
    timestamps: true,
  }
);


userSchema.pre('save', async function (){
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password,12);
  }
})

userSchema.methods.comparePassword = async function (password){
  return await bcrypt.compare(password, this.password)
}


module.exports = mongoose.model("user", userSchema);
