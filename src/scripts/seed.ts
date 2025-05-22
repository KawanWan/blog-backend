import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1) Limpa tabelas (importante por causa das FK)
  await prisma.article.deleteMany()
  await prisma.user.deleteMany()

  // 2) Cria 5 usuários com avatar opcional
  const users: { id: string }[] = []
  const passwordPlain = 'Senha123!'
  const passwordHash = await bcrypt.hash(passwordPlain, 10)

  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        avatar: Math.random() < 0.7 ? faker.image.avatar() : null, // 70% chance de ter avatar
      },
    })
    users.push({ id: user.id })
  }

  // 3) Cria 20 artigos vinculados aos usuários, com thumbnailUrl e sem BLOB default
  for (let i = 0; i < 20; i++) {
    await prisma.article.create({
      data: {
        title: faker.lorem.sentence().slice(0, 80),
        content: faker.lorem.paragraphs({ min: 1, max: 3 }, '\n\n'),
        thumbnailUrl: Math.random() < 0.8 ? faker.image.urlPicsumPhotos({ width: 640, height: 480 }) : null,
        // Deixando o campo image BLOB vazio (null)
        image: null,
        authorId: faker.helpers.arrayElement(users).id,
        // publishedAt e updatedAt são populados pelo default do schema
      },
    })
  }

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })