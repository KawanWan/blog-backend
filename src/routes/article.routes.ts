import express from 'express'
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle
} from '../controllers/article.controller'
import { authMiddleware } from '../middlewares/auth'

const router = express.Router()

router.get('/', getArticles)
router.get('/:id', getArticleById)

router.post('/', authMiddleware, createArticle)
router.put('/:id', authMiddleware, updateArticle)
router.delete('/:id', authMiddleware, deleteArticle)

export default router