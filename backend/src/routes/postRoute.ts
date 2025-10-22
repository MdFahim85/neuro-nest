import express from "express";
import {
  createPost,
  deletePost,
  getAllPosts,
  getSinglePost,
  updatePost,
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

module.exports = router;
