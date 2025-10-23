import express from "express";
const router = express.Router();
import {
  changeUserPassword,
  followUser,
  getMyDetails,
  getSavedPosts,
  getUserDetails,
  getUserFollowers,
  getUserFollowings,
  getUserPosts,
  unfollowUser,
  updateMyDetails,
} from "../controllers/userController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

// Personal routes
router
  .route("/me")
  .get(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), getMyDetails)
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    updateMyDetails
  );

router
  .route("/me/change-password")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    changeUserPassword
  );

router
  .route("/me/saved-posts")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    getSavedPosts
  );

// User routes
router.route("/:userId").get(getUserDetails);
router.route("/:userId/posts").get(getUserPosts);
router
  .route("/:userId/follow")
  .post(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), followUser)
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    unfollowUser
  );

router.route("/:userId/followings").get(getUserFollowings);
router.route("/:userId/followers").get(getUserFollowers);

module.exports = router;
