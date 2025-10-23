import express from "express";
import {
  createCommunity,
  deleteCommunity,
  getAllCommunities,
  getCommunityDetails,
  getCommunityMembers,
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
  updateCommunity,
} from "../controllers/communityController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

// Community crud routes
router
  .route("/")
  .get(getAllCommunities)
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    createCommunity
  );
router
  .route("/:communityId")
  .get(getCommunityDetails)
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    updateCommunity
  )
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT", "ADMIN", "SUPER_ADMIN"),
    deleteCommunity
  );

// Community join and leave routes
router
  .route("/:communityId/join")
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    joinCommunity
  );

router
  .route("/:communityId/leave")
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    leaveCommunity
  );

// Get community members route
router.route("/:communityId/members").get(getCommunityMembers);

// Get community posts
router.route("/:communityId/posts").get(getCommunityPosts);

module.exports = router;
