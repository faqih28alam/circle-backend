// auth-route.ts
// src/routes/auth-route.ts

import express from 'express';
import { handleLogin, handleRegister, checkAuth } from '../controllers/auth-controller';
import { authMiddleware } from '../middlewares/auth-middleware';
import { upload } from '../utils/multer';

// import { limiter } from '../middlewares/rate-limiter';

const router = express.Router();

router.post('/login', handleLogin)
router.post('/register', upload.single('photo_profile'), handleRegister)
router.get('/check', authMiddleware, checkAuth)

router.get('/me', authMiddleware, (req, res) => { 
    res.json({ Message: "Welcome to the secret area!", user: (req as any).user });
});

// router.get('/me', limiter ,authMiddleware, (req, res) => { 
//     res.json({ Message: "protected route" });
// });

export default router;