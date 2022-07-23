const { check, validationResult } = require("express-validator");
const { sendError } = require("./helper");

exports.validateRegister = [
  check("fullName").notEmpty().withMessage("Họ tên không được bỏ trống"),
  check("userName")
    .notEmpty()
    .withMessage("User name dùng không được bỏ trống"),
  check("password")
    .notEmpty()
    .withMessage("Mật khẩu không được bỏ trống")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu tối thiểu 8 ký tự"),
  check("email").isEmail().withMessage("Email không đúng định dạng"),
  check("gender").notEmpty().withMessage("Giới tính không được bỏ trống"),
];

exports.validateLogin = [
  check("password")
    .notEmpty()
    .withMessage("Mật khẩu không được bỏ trống")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu tối thiểu 8 ký tự"),
  check("email").isEmail().withMessage("Email không đúng định dạng"),
];

exports.valiedatePassword = [
  check("password")
    .notEmpty()
    .withMessage("Mật khẩu không được bỏ trống")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu tối thiểu 8 ký tự"),
];

exports.validator = (req, res, next) => {
  const error = validationResult(req);
  if (error.errors[0]) return sendError(res, error.errors[0].msg);

  next();
};
