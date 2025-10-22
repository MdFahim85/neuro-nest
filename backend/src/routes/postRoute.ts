import express from "express";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
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
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    createPost
  );

//Search posts route
router.route("/search").get(searchPosts);

// Single post routes
router
  .route("/:postId")
  .get(getSinglePost)
  .put(
    authMiddleware,
    authorizeRoles(
      "REGULAR_USER",
      "STUDENT",
      "MODERATOR",
      "ADMIN",
      "SUPER_ADMIN"
    ),
    updatePost
  )
  .delete(
    authMiddleware,
    authorizeRoles(
      "REGULAR_USER",
      "STUDENT",
      "MODERATOR",
      "ADMIN",
      "SUPER_ADMIN"
    ),
    deletePost
  );

// Comment routes
router
  .route("/:postId/comments")
  .get(getPostComments)
  .post(
    authMiddleware,
    authorizeRoles("MODERATOR", "REGULAR_USER", "STUDENT"),
    createComment
  );
router
  .route("/:postId/comments/:commentId")
  .put(
    authMiddleware,
    authorizeRoles(
      "REGULAR_USER",
      "STUDENT",
      "MODERATOR",
      "ADMIN",
      "SUPER_ADMIN"
    ),
    updateComment
  )
  .delete(
    authMiddleware,
    authorizeRoles(
      "REGULAR_USER",
      "STUDENT",
      "MODERATOR",
      "ADMIN",
      "SUPER_ADMIN"
    ),
    deleteComment
  );
// Comment vote toggle route
router
  .route("/:postId/comments/:commentId/vote")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    voteToggleComment
  );

// Vote toggle route
router
  .route("/:postId/vote")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    voteToggle
  );

// Save post toggle route
router
  .route("/:postId/save")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    savePostToggle
  );

module.exports = router;
