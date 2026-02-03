import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.ts";
import { authorize } from "../middlewears/authorized.middlewears.ts";
import { requireAdmin } from "../middlewears/admin.middlewears.ts";
import { uploadProfilePicture } from "../middlewears/uploadProfilePicture.middlewears.ts";

const router = Router();
const adminController = new AdminController();

router.post(
  "/users",
  authorize,
  requireAdmin,
  uploadProfilePicture.single("photo"),
  adminController.createUser
);

router.get("/users", authorize, requireAdmin, adminController.getUsers);

router.get("/users/:id", authorize, requireAdmin, adminController.getUserById);

router.put(
  "/users/:id",
  authorize,
  requireAdmin,
  uploadProfilePicture.single("photo"),
  adminController.updateUser
);

router.delete("/users/:id", authorize, requireAdmin, adminController.deleteUser);

export default router;
