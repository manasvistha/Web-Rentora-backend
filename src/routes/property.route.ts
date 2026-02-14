import { Router } from "express";
import multer from "multer";
import path from "path";
import { PropertyController } from "../controllers/property.controller";
import { authorize } from "../middlewears/authorized.middlewears";

const router = Router();
const propertyController = new PropertyController();

// Configure multer for property images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'property-images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post("/", authorize, upload.array('images', 10), (req, res, next) => {
  console.log('Property create route hit:', {
    body: req.body,
    files: req.files,
    user: (req as any).user
  });
  propertyController.createProperty(req, res);
});
router.get("/", propertyController.getAllProperties.bind(propertyController));
router.get("/my", authorize, propertyController.getMyProperties.bind(propertyController));
router.get("/search", propertyController.searchByLocation.bind(propertyController));
router.get("/:id", propertyController.getPropertyById.bind(propertyController));
router.put("/:id", authorize, propertyController.updateProperty.bind(propertyController));
router.delete("/:id", authorize, propertyController.deleteProperty.bind(propertyController));

// Admin routes
router.put("/:id/assign", authorize, propertyController.assignProperty.bind(propertyController));
router.put("/:id/status", authorize, propertyController.updatePropertyStatus.bind(propertyController));

export default router;