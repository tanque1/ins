const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) return sendError(res, "Vui lòng đăng nhập!");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    if (!decoded) return sendError(res, "Xác thực không hợp lệ!");

    const user = await User.findOne({_id:decoded.id});

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, error.message || error);
  }
};

