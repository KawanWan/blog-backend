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

router.post(
  '/',
  authMiddleware,
  upload.single('thumbnail'),   // campo “thumbnail” do FormData
  createArticle
);

router.put(
  '/:id',
  authMiddleware,
  upload.single('thumbnail'),
  updateArticle
);

router.delete('/:id', authMiddleware, deleteArticle);

export default router;