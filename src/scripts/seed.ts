import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1) Limpa tabelas (importante fazer na ordem certa por causa das FK)
  await prisma.article.deleteMany()
  await prisma.user.deleteMany()

  const users = []
  const passwordPlain = 'Senha123!'
  const passwordHash = await bcrypt.hash(passwordPlain, 10)

  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
      },
    })
    users.push(user)
  }

  // 3) Cria 20 artigos vinculados aos usuários
  for (let i = 0; i < 20; i++) {
    await prisma.article.create({
      data: {
        title: faker.lorem.sentence().slice(0, 80),
        content: faker.lorem.paragraphs({ min: 1, max: 3 }, '\n\n'),
        // image: opcional, aqui deixamos como null
        authorId: faker.helpers.arrayElement(users).id,
        // publishedAt e updatedAt são preenchidos pelos defaults do schema
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