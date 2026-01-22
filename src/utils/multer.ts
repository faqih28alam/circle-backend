// multer.ts
import multer from "multer";
import path from "path";


// Multer configuration
const storage = multer.diskStorage({
    destination: 'src/uploads', 
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});


// Multer middleware
export const upload = multer({                          // upload middleware
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      return cb(null, false);
    }
    cb(null, true);
  },
});