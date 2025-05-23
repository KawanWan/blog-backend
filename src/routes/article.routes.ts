import express from 'express';
import multer from 'multer';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle
} from '../controllers/article.controller';
import { authMiddleware } from '../middlewares/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getArticles);
router.get('/:id', getArticleById);

// POST continua usando 'thumbnail'
router.post(
  '/',
  authMiddleware,
  upload.single('thumbnail'),
  createArticle
);

// PUT passa a usar 'image' para não dar "Unexpected field"
router.put(
  '/:id',
  authMiddleware,
  upload.single('image'),
  updateArticle
);

router.delete('/:id', authMiddleware, deleteArticle);

export default router;