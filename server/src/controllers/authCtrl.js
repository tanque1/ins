const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const {
  sendError,
  generateOTP,
  generateRandomByte,
} = require("../utils/helper");
const transport = require("../config/mail");
const { verifyEmail, resetPassword } = require("../utils/templateMail");
const EmailVerificationToken = require("../models/emailVerifyModel");
const PasswordVerificationToken = require("../models/passwordVerifyModel");

const { isValidObjectId } = require("mongoose");
const authCtrl = {
  register: async (req, res) => {
    const { fullName, userName, email, password, gender } = req.body;
    const newUserName = userName.toLowerCase().replace(/ /g, "");

    const user_name = await User.findOne({ userName: newUserName });

    if (user_name) return sendError(res, "Người dùng đã tồn tại.");

    const user_email = await User.findOne({ email: email });

    if (user_email) return sendError(res, "Email đã tồn tại.");

    const newUser = new User({
      fullName,
      userName: newUserName,
      email: email?.toLowerCase(),
      password,
      gender,
    });

    const otp = generateOTP();

    await newUser.save();
    await EmailVerificationToken.create({ owner: newUser._id, token: otp });

    await transport.sendMail({
      from: "verification@t&t.com",
      to: newUser.email,
      subject: "Email Xác Thực",
      html: verifyEmail(otp),
    });

    const refresh_token = createRefreshToken({ id: newUser._id });
    const access_token = createAccessToken({ id: newUser._id });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/refresh_token",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res
      .status(200)
      .json({
        msg: "Đăng kí thành công!",
        token: access_token,
        profile: newUser,
      });
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendError(res, "Người dùng không tồn tại");

    const check = await user.comparePassword(password);

    if (!check) return sendError(res, "Mật khẩu không đúng");

    const refresh_token = createRefreshToken({ id: user._id });
    const access_token = createAccessToken({ id: user._id });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/refresh_token",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      token: access_token,
      profile: user,
      msg: "Đăng nhập thành công",
    });
  },
  verifyEmail: async (req, res) => {
    const { otp, userId } = req.body;
    if (!isValidObjectId(userId))
      return sendError(res, "Mã người dùng không hợp lệ!");

    const user = await User.findById(userId);
    if (!user) return sendError(res, "Không tìm thấy người dùng");

    if (user.isVerify) return sendError(res, "Người dùng đã được xác nhận!");

    const token = await EmailVerificationToken.findOne({ owner: userId });
    if (!token) return sendError(res, "Không tìm thấy mã xác thực!");
    const isMatch = await token.compareToken(otp);
    if (!isMatch) return sendError(res, "Mã xác nhận không hợp lệ!");

    user.isVerify = true;

    await user.save();

    const refresh_token = createRefreshToken({ id: user._id });
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/api/refresh_token",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ msg: "Xác nhận thành công" });
  },
  resendVerifyEmail: async (req, res) => {
    const { userId } = req.body;

    if (!isValidObjectId(userId))
      return sendError(res, "Người dùng không tồn tại!");

    const user = await User.findById(userId);

    if (!user) return sendError(res, "Người dùng không tồn tại!");

    if (user.isVerify) return sendError(res, "Người dùng đã được xác nhận!");

    const token = await EmailVerificationToken.findOne({ owner: userId });

    if (token) {
      const timeAgo = Date.now() - new Date(token.createdAt);
      return sendError(
        res,
        `Mã xác nhận sẽ được gửi lại sau ${
          60 - Math.floor(timeAgo / 60000)
        } phút`
      );
    }

    const otp = generateOTP();

    await newUser.save();
    await EmailVerificationToken.create({ owner: newUser._id, token: otp });

    await transport.sendMail({
      from: "verification@t&t.com",
      to: newUser.email,
      subject: "Email Xác Thực",
      html: verifyEmail(otp),
    });

    return res.status(200).json({ msg: "Mã xác nhận đã gửi qua mail" });
  },
  forgetPassword: async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).json({ msg: "Không tìm thấy người dùng" });

    const alreadyHasToken = await PasswordVerificationToken.findOne({
      owner: user._id,
      email: email,
    });

    if (alreadyHasToken) {
      const timeAgo = Date.now() - new Date(alreadyHasToken.createdAt);
      return sendError(
        res,
        `Mã xác nhận sẽ được gửi lại sau ${
          60 - Math.floor(timeAgo / 60000)
        } phút`
      );
    }

    const token = await generateRandomByte();

    const string = `http://localhost:3000/auth/rest-password?token=${token}&id=${user._id}`;

    await transport.sendMail({
      from: "verification@t&t.com",
      to: user.email,
      subject: "Khôi phục mật khẩu",
      html: resetPassword(string),
    });

    await PasswordVerificationToken.create({ owner: user._id, token });

    return res
      .status(200)
      .json({ msg: "Link khôi phục đã được gửi qua email" });
  },
  passwordTokenStatus: async (req, res) => {
    const { token, id } = req.body;

    if (!token.trim() || !isValidObjectId(id))
      return sendError(res, "Yêu cầu không hợp lệ");

    const resetToken = await PasswordVerificationToken.findOne({
      owner: id,
    });

    if (!resetToken)
      return sendError(res, "Truy cập trái phép, yêu cầu không hợp lệ");

    const isMatched = resetToken.compareToken(token);

    if (!isMatched)
      return sendError(res, "Truy cập trái phép, yêu cầu không hợp lệ");

    return res.status(200).json({ msg: "Truy cập hợp lệ" });
  },
  resetPassword: async (req, res) => {
    const { password, userId } = req.body;

    if (!isValidObjectId(userId)) return sendError(res, "Yêu cầu không hợp lệ");

    const user = await User.findById(userId);

    const result = await user.comparePassword(password);

    if (result) return sendError(res, "Không được nhập mật khẩu cũ");

    user.password = password;

    await user.save();

    return res.status(200).json({ msg: "Mật khẩu thay đổi thành công" });
  },
  logout: async (req, res) => {
    res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
    return res.status(200).json({ msg: "Đẵng xuất thành công" });
  },
  generateAccessToken: async (req, res) => {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token) return sendError(res, "Bạn chưa đăng nhập!");

    jwt.verify(rf_token, process.env.REFRESH_TOKEN, async (err, result) => {
      if (err) return sendError(res, "Bạn chưa đăng nhập");

      const user = await User.findById(result.id)
        .populate("followers following", "-password")
        .select("-password");
      if (!user) return sendError(res, "Không tìm thấy người dùng!");
      const access_token = createAccessToken({ id: result.id });

      return res.status(200).json({ token: access_token, profile: user });
    });
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "30d" });
};

module.exports = authCtrl;
