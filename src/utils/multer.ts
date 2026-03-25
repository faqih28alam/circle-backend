// src/utils/multer.ts

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import path from "path";

// Cloudinary storage — files go directly to Cloudinary, no local disk needed
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Decide folder based on which route is uploading
    const isProfilePicture = req.path?.includes("update") || req.path?.includes("register");
    const folder = isProfilePicture ? "circle/avatars" : "circle/posts";

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png"],
      // Use timestamp as filename to keep it unique
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
    };
  },
});

// Multer middleware
export const upload = multer({                                  // upload middleware
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      return cb(null, false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});