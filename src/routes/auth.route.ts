import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.ts";
import { authorize } from "../middlewears/authorized.middlewears.ts";
import { uploadProfilePicture } from "../middlewears/uploadProfilePicture.middlewears.ts";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes (require JWT token)
router.get("/profile", authorize, authController.getProfile);
router.get("/current-user", authorize, authController.getProfile); // Alias for compatibility
router.post("/upload-photo", authorize, uploadProfilePicture.single('photo'), authController.uploadPhoto);

export default router;
