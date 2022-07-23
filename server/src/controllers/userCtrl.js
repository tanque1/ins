const { isValidObjectId } = require("mongoose");
const User = require("../models/userModel");
const { sendError } = require("../utils/helper");
const userCtrl = {
  searchUser: async (req, res) => {
    const { username } = req.query;
    const users = await User.find({
      userName: { $regex: username, $options: "i" },
    })
      .limit(10)
      .select("fullName userName avatar");
    return res.status(200).json({ result: users });
  },
  getUser: async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Người dùng không hợp lệ");

    const user = await User.findById(id).select("-password").populate("followers following", '-password');
    if (!user) return sendError(res, "Không tìm thấy người dùng");

    return res.status(200).json({ profile: user });
  },
  updateUser: async (req, res) => {
    const { avatar, fullName, mobile, address, story, website, gender } =
      req.body;
    console.log(avatar);

    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      {
        avatar,
        fullName,
        mobile,
        address,
        story,
        website,
        gender,
      },
      { new: true }
    );

    return res
      .status(200)
      .json({ msg: "Cập nhật thông tin thành công", result: user });
  },
  follow: async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) return sendError(res, "Người dùng không hợp lệ!");
    const user = await User.find({ _id: id, followers: req.user._id });
    console.log(user);
    if (user.length > 0)
      return sendError(res, "Bạn đã theo dõi người dùng này rồi!");

    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { following: id },
      },
      { new: true }
    );

    await User.findOneAndUpdate(
      { _id: id },
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );

    res.status(200).json({ msg: "Theo dõi thành công!" });
  },
  unFollow: async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) return sendError(res, "Người dùng không hợp lệ!");

    await User.findOneAndUpdate(
      { _id: id },
      {
        $pull: { followers: req.user._id },
      },
      { new: true }
    );
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $pull: { following: id },
      },
      { new: true }
    );

    res.status(200).json({ msg: " Huỷ theo dõi thành công!" });
  },
};

module.exports = userCtrl;
