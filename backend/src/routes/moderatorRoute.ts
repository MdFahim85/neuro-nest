import express from "express";
import {
  createModerator,
  deleteModerator,
  getAllModerators,
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

module.exports = router;
