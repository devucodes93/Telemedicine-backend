import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

// Disk Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "instagram_uploads", // Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png","webp"], // allowed file types
    public_id: (req, file) =>
      file.originalname.split(".")[0] + "_" + Date.now(),
  },
});

const upload = multer({ storage: storage });

export const UplodingMulter = upload.single("File");
