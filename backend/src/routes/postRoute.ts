import express from "express";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getCommentReplies,
  getPostComments,
  getSinglePost,
  savePostToggle,
  searchPosts,
  updateComment,
  updatePost,
  voteToggle,
  voteToggleComment,
} from "../controllers/postController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

// All posts routes
router
  .route("/")
  .get(getAllPosts)
  .post(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), createPost);

//Search posts route
router.route("/search").get(searchPosts);

// Single post routes
router
  .route("/:postId")
  .get(getSinglePost)
  .put(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), updatePost)
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "ADMIN", "SUPER_ADMIN"),
    deletePost
  );

// Comment routes
router
  .route("/:postId/comments")
  .get(getPostComments)
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    createComment
  );
router
  .route("/:postId/comments/:commentId")
  .get(getCommentReplies)
  .put(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), updateComment)
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "ADMIN", "SUPER_ADMIN"),
    deleteComment
  );
// Comment vote toggle route
router
  .route("/:postId/comments/:commentId/vote")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    voteToggleComment
  );

// Vote toggle route
router
  .route("/:postId/vote")
  .post(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), voteToggle);

// Save post toggle route
router
  .route("/:postId/save")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    savePostToggle
  );

module.exports = router;
