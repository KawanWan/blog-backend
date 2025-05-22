import express from 'express'
import { register, login, getProfile } from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/auth'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)

router.get('/profile', authMiddleware, getProfile)

export default router