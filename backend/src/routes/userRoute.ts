import express from "express";
const router = express.Router();
import {
  changeUserPassword,
  followUser,
  getMyDetails,
  getSavedPosts,
  getUserDetails,
  getUserPosts,
  unfollowUser,
  updateMyDetails,
} from "../controllers/userController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

// Personal routes
router
  .route("/me")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    getMyDetails
  )
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    updateMyDetails
  );

router
  .route("/me/change-password")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    changeUserPassword
  );

router
  .route("/me/saved-posts")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "MODERATOR"),
    getSavedPosts
  );

// User routes
router.route("/:userId").get(getUserDetails);
router.route("/:userId/posts").get(getUserPosts);
router
  .route("/:userId/follow")
  .post(
    authMiddleware,
    authorizeRoles("MODERATOR", "REGULAR_USER", "STUDENT"),
    followUser
  )
  .delete(
    authMiddleware,
    authorizeRoles("MODERATOR", "REGULAR_USER", "STUDENT"),
    unfollowUser
  );

module.exports = router;
