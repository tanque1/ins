const crypto = require('crypto')

exports.sendError = (res,message,code = 400) => {
    return res.status(code).json({msg: message});
}


exports.handleError = (err, req, res, next) =>{
    if(err) return res.status(500).json({message: err.message||err});
}

exports.generateOTP = () =>{
    let otp = '';
    new Array(6).fill('').forEach(_ =>{
        otp += Math.floor(Math.random() * 10)
    })
    return otp;
}

exports.generateRandomByte = () => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(30, (err, buf) => {
        if (err) reject(err);
        const buffString = buf.toString("hex");
        resolve(buffString);
      });
    });
  };