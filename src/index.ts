import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/user.routes'
import articleRoutes from './routes/article.routes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/users',    userRoutes)
app.use('/api/articles', articleRoutes)

const PORT = process.env.PORT || 3333
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))