const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");

//@route POST api/posts
//desc Create post
//@access Private
router.post(
  "/",
  [auth, [check("text", "Text is required!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

//@route GET api/posts
//desc Get all post
//@access Private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//@route GET api/posts/:id
//desc Get  post by id
//@access Private
router.get("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (!posts) {
      return res.status(404).json({ msg: "Post not found!" });
    }
    res.json(posts);
  } catch (error) {
    if (error.kind === "objectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(error);
    res.status(500).send("Server error");
  }
});

//@route DELETE api/posts/:id
//desc Delete post by id
//@access Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }

    //check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized!" });
    }
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (error) {
    if (error.kind === "objectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(error);
    res.status(500).send("Server error");
  }
});

//@route PUT api/posts/like/:id
//desc like a post by id
//@access Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//@route PUT api/posts/like/:id
//desc unlike a post by id
//@access Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if the post been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post has not been liked" });
    }
    const newLikeList = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );
    post.likes = newLikeList;
    await post.save();
    return res.json(post.likes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

//@route POST api/posts/coment/:id
//desc Create comment
//@access Private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required!").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

//@route POST api/posts/coment/:id/:comment_id
//desc delete comment
//@access Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = await post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    const newCommentsList = post.comments.filter(
      (comment) => comment.user.toString() !== req.user.id
    );
    post.comments = newCommentsList;
    await post.save();
    return res.json(post.comments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
