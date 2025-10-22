import express from "express";
import {
  createCommunity,
  getAllCommunities,
  getCommunityDetails,
} from "../controllers/communityController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .get(getAllCommunities)
  .post(
    authMiddleware,
    authorizeRoles("MODERATOR", "REGULAR_USER", "STUDENT"),
    createCommunity
  );
router.route("/:communityId").get(getCommunityDetails);

module.exports = router;
