import express from "express";
const router = express.Router();
import {
  getMyDetails,
  getUserDetails,
  updateMyDetails,
} from "../controllers/userController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

router
  .route("/me")
  .get(authMiddleware, authorizeRoles("REGULAR_USER", "STUDENT"), getMyDetails)
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    updateMyDetails
  );

router.route("/:userId").get(getUserDetails);

module.exports = router;
