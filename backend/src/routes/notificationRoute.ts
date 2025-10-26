import express from "express";
import {
  deleteAllNotifications,
  deleteNotification,
  getAllNotifications,
  markAllAsRead,
  readNotification,
} from "../controllers/notificationController";
import { authMiddleware, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    getAllNotifications
  );

router
  .route("/:notificationId")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    readNotification
  )
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    deleteNotification
  );

router
  .route("/mark-all-read")
  .put(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    markAllAsRead
  );

router
  .route("/clear-all")
  .delete(
    authMiddleware,
    authorizeRoles("REGULAR_USER", "STUDENT"),
    deleteAllNotifications
  );

module.exports = router;
