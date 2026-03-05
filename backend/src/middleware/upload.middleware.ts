import fs from "fs";
import path from "path";
import multer from "multer";
import { AppError } from "../utils/app-error";

const uploadBaseDir = path.resolve(__dirname, "..", "..", "uploads", "clinic-images");
fs.mkdirSync(uploadBaseDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadBaseDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

export const uploadClinicImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image uploads are allowed", 400));
      return;
    }
    cb(null, true);
  }
});
