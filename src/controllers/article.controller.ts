import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getArticles = async (_: Request, res: Response): Promise<void> => {
  try {
    const articles = await prisma.article.findMany({ 
      include: { author: true } 
    })
    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar artigos' })
  }
}

export const getArticleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: { author: true }
    })
    
    if (!article) {
      res.status(404).json({ error: 'Artigo não encontrado' })
      return
    }
    
    res.json(article)
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar artigo' })
  }
}

export const createArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, image } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const imageBuffer = image ? Buffer.from(image, 'base64') : undefined

    const article = await prisma.article.create({
      data: { 
        title, 
        content, 
        image: imageBuffer, 
        authorId: userId
      }
    })

    res.status(201).json(article)
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar artigo' })
  }
}

export const updateArticle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, image } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({ error: 'Não autorizado' })
      return
    }

    const article = await prisma.article.findUnique({
      where: { id: req.params.id }
    })

    if (!article || article.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' })
      return
    }

    const updated = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        image: image ? Buffer.from(image, 'base64') : article.image
      }
    })

    res.json(updated)
  } catch (error) {
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

    const article = await prisma.article.findUnique({
      where: { id: req.params.id }
    })

    if (!article || article.authorId !== userId) {
      res.status(403).json({ error: 'Não autorizado' })
      return
    }

    await prisma.article.delete({ where: { id: article.id } })
    res.json({ message: 'Artigo deletado' })
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar artigo' })
  }
}