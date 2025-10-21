import express from "express";
import { signUp } from "../controllers/authController";

const router = express.Router();

router.route("/register").post(signUp);
router.route("/login").post(signUp);

module.exports = router;
