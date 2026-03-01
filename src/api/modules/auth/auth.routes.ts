import { Router } from "express";
import { register, login, me, logout, getProfile, updateProfile } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.schema";
import { validate } from "../../utils/validate";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authMiddleware, me);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", logout);


export default router;