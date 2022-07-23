const Posts = require("../models/postModel");
const { sendError } = require("../utils/helper");

const postCtrl = {
  createPost: async (req, res) => {
    const { content, images } = req.body;

    if (!images.length) return sendError(res, "Hình không được bỏ trống");

    const newPost = new Posts({
      content,
      images,
      user: req.user._id,
    });

    await newPost.save();
    res.status(200).json({
      msg: "Tạo post thành công",
      post: newPost,
    });
  },
  getPosts: async (req, res) => {
    const posts = await Posts.find({
      user: [...req.user.following, req.user._id],
    }).populate("user likes", "avatar userName fullName");


    res.json({ msg: "Thành công!", result: posts.length, posts });
  },
};

module.exports = postCtrl;
