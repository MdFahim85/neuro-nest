import express from "express";
const router = express.Router();
import { getAllUsers } from "../controllers/userController";
import { authMiddleware } from "../middlewares/auth";

router.route("/me").get(authMiddleware, getAllUsers);

module.exports = router;
