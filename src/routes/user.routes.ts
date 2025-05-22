import express from 'express'
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/auth'
import { uploadAvatar } from '../middlewares/uploadAvatar'

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

export default router
