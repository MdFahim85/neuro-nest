import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  savePostToggle,
  searchPosts,
  updatePost,
  voteToggle,
} from "../controllers/postController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .get(getAllPosts)
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    createPost
  );

router.route("/search").get(searchPosts);

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

router
  .route("/:postId/vote")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    voteToggle
  );

router
  .route("/:postId/save")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    savePostToggle
  );

module.exports = router;
