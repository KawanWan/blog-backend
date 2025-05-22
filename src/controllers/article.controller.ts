import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getArticles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        publishedAt: true,
        thumbnailUrl: true,
        author: {
          select: { id: true, name: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })
    res.json(articles)
  } catch (error) {
    console.error('Erro getArticles:', error)
    res.status(500).json({ error: 'Erro ao buscar artigos' })
  }
}

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const dbArticle = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } }
      }
    })
    if (!dbArticle) {
      res.status(404).json({ error: 'Artigo não encontrado' })
      return
    }

    const imageBase64 = dbArticle.image
      ? Buffer.from(dbArticle.image).toString('base64')
      : ''

    res.json({
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      publishedAt: dbArticle.publishedAt,
      updatedAt: dbArticle.updatedAt,
      thumbnailUrl: dbArticle.thumbnailUrl,
      image: imageBase64,
      author: {
        id: dbArticle.author.id,
        name: dbArticle.author.name,
        email: dbArticle.author.email || null,
        avatar: dbArticle.author.avatar || null
      }
    })
  } catch (error) {
    console.error('Erro getArticleById:', error)
    res.status(500).json({ error: 'Erro ao buscar artigo' })
  }
}

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, thumbnailUrl } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const imageBuffer = req.body.image
      ? Buffer.from(req.body.image as string, 'base64')
      : undefined

    const article = await prisma.article.create({
      data: {
        title,
        content,
        thumbnailUrl: thumbnailUrl || undefined,
        image: imageBuffer,
        authorId: userId
      }
    })

    res.status(201).json(article)
  } catch (error) {
    console.error('Erro createArticle:', error)
    res.status(400).json({ error: 'Erro ao criar artigo' })
  }
}

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, thumbnailUrl } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const existing = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' })
      return
    }

    const imageBuffer = req.body.image
      ? Buffer.from(req.body.image as string, 'base64')
      : existing.image || undefined

    const updated = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        thumbnailUrl: thumbnailUrl || existing.thumbnailUrl || undefined,
        image: imageBuffer
      }
    })

    res.json(updated)
  } catch (error) {
    console.error('Erro updateArticle:', error)
    res.status(400).json({ error: 'Erro ao atualizar artigo' })
  }
}

export const deleteArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const existing = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' })
      return
    }

    await prisma.article.delete({ where: { id: req.params.id } })
    res.json({ message: 'Artigo deletado' })
  } catch (error) {
    console.error('Erro deleteArticle:', error)
    res.status(400).json({ error: 'Erro ao deletar artigo' })
  }
}
