import express from "express";
import { register, login, resetUserPassword } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", protect, authorize("admin"), resetUserPassword);

export default router;
