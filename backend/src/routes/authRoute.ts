import express from "express";
import { signIn, signOut, signUp } from "../controllers/authController";

const router = express.Router();

router.route("/register").post(signUp);
router.route("/login").post(signIn);
router.route("/logout").get(signOut);

module.exports = router;
