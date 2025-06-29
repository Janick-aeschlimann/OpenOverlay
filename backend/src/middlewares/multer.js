import multer from "multer";
import fs from "fs";
import path from "path";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const imageFileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

function createMulterConfig(folderName) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, "../..", "uploads", folderName);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max
    },
  });
}

export const uploadProfilePicture = createMulterConfig("profile-pictures");
export const uploadWorkspaceLogo = createMulterConfig("workspace-logos");
