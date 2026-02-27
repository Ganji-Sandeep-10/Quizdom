import { Router } from "express";
import { register, login } from "./auth.controller";
import { registerSchema, loginSchema } from "./auth.schema";
import { validate } from "../../utils/validate";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;