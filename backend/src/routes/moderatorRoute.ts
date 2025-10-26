import express from "express";
import {
  communityVisibility,
  createModerator,
  deleteModerator,
  getAllModerators,
  getJoinRequests,
  handleJoinRequest,
} from "../controllers/moderatorController";
import {
  authMiddleware,
  authorizeRoles,
  moderatorVerify,
} from "../middlewares/auth";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    getAllModerators
  )
  .post(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    createModerator
  )
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    deleteModerator
  );

router
  .route("/join-requests")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    getJoinRequests
  );

router
  .route("/join-requests/:requestId")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    handleJoinRequest
  );

router
  .route("/change-visibility")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    moderatorVerify,
    communityVisibility
  );

module.exports = router;
