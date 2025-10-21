import express from "express";
import { signIn, signUp } from "../controllers/authController";

const router = express.Router();

router.route("/register").post(signUp);
router.route("/login").post(signIn);

module.exports = router;
