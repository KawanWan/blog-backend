import { Request, Response } from 'express';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const WALLPAPER_WIDTH = 1920;
const WALLPAPER_HEIGHT = 1080;

async function resizeToWallpaper(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(WALLPAPER_WIDTH, WALLPAPER_HEIGHT, { fit: 'cover' })
    .toFormat('jpeg')
    .toBuffer();
}

// GET /articles
export const getArticles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const raw = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        publishedAt: true,
        image: true,
        thumbnailUrl: true,
        author: { select: { id: true, name: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });

    const articles = raw.map(a => ({
      id: a.id,
      title: a.title,
      publishedAt: a.publishedAt,
      thumbnailUrl: a.image
        ? `data:image/jpeg;base64,${Buffer.from(a.image).toString('base64')}`
        : a.thumbnailUrl || null,
      author: a.author
    }));

    res.json(articles);
  } catch (err) {
    console.error('Erro getArticles:', err);
    res.status(500).json({ error: 'Erro ao buscar artigos' });
  }
};

// GET /articles/:id
export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbArticle = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });
    if (!dbArticle) {
      res.status(404).json({ error: 'Artigo não encontrado' });
      return;
    }

    const imageBase64 = dbArticle.image
      ? Buffer.from(dbArticle.image).toString('base64')
      : null;

    const avatarBase64 = dbArticle.author.avatar
      ? Buffer.from(dbArticle.author.avatar).toString('base64')
      : null;

    res.json({
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      publishedAt: dbArticle.publishedAt,
      updatedAt: dbArticle.updatedAt,
      image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : null,
      author: {
        id: dbArticle.author.id,
        name: dbArticle.author.name,
        email: dbArticle.author.email || null,
        avatar: avatarBase64 ? `data:image/jpeg;base64,${avatarBase64}` : null
      }
    });
  } catch (err) {
    console.error('Erro getArticleById:', err);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
};

// POST /articles
export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
      return;
    }

    let imageBuffer: Buffer | undefined;
    if (req.file && (req.file as Express.Multer.File).buffer) {
      imageBuffer = await resizeToWallpaper((req.file as Express.Multer.File).buffer);
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        image: imageBuffer,
        authorId: userId
      }
    });

    const thumb = article.image
      ? `data:image/jpeg;base64,${Buffer.from(article.image).toString('base64')}`
      : null;

    res.status(201).json({
      id: article.id,
      title: article.title,
      publishedAt: article.publishedAt,
      thumbnailUrl: thumb
    });
  } catch (err) {
    console.error('Erro createArticle:', err);
    res.status(500).json({ error: 'Falha ao criar artigo' });
  }
};

// PUT /articles/:id
export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' });
      return;
    }

    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
      return;
    }

    let imageBuffer = existing.image;
    if (req.file && (req.file as Express.Multer.File).buffer) {
      imageBuffer = await resizeToWallpaper((req.file as Express.Multer.File).buffer);
    }

    const updated = await prisma.article.update({
      where: { id: req.params.id },
      data: { title, content, image: imageBuffer }
    });

    const thumb = updated.image
      ? `data:image/jpeg;base64,${Buffer.from(updated.image).toString('base64')}`
      : null;

    res.json({
      id: updated.id,
      title: updated.title,
      publishedAt: updated.publishedAt,
      thumbnailUrl: thumb
    });
  } catch (err) {
    console.error('Erro updateArticle:', err);
    res.status(500).json({ error: 'Erro ao atualizar artigo' });
  }
};

// DELETE /articles/:id
export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }

    const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' });
      return;
    }

    await prisma.article.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    console.error('Erro deleteArticle:', err);
    res.status(500).json({ error: 'Erro ao deletar artigo' });
  }
};