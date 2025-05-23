import express from 'express'
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/auth'
import { uploadAvatar } from '../middlewares/uploadAvatar'
import { forgotPassword, resetPassword } from '../controllers/auth.controller';

const router = express.Router()

router.post('/register', register)
router.post('/login',    login)
router.get('/profile',   authMiddleware, getProfile)

router.patch(
  '/profile',
  authMiddleware,
  uploadAvatar,
  updateProfile
)

router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

export default router
