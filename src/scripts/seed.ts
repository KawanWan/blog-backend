import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'
import axios from 'axios'

const prisma = new PrismaClient()

async function main() {
  await prisma.article.deleteMany()
  await prisma.user.deleteMany()

  const users: { id: string }[] = []
  const passwordHash = await bcrypt.hash('Senha123!', 10)

  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: passwordHash,
        avatar: null,
      },
    })
    users.push({ id: user.id })
  }

  for (let i = 0; i < 20; i++) {
    const url = `https://picsum.photos/seed/${i}/640/480`
    const response = await axios.get<ArrayBuffer>(url, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)

    await prisma.article.create({
      data: {
        title: faker.lorem.sentence().slice(0, 80),
        content: faker.lorem.paragraphs({ min: 1, max: 3 }, '\n\n'),
        image: buffer,
        thumbnailUrl: null,
        authorId: faker.helpers.arrayElement(users).id,
      },
    })
  }

  console.log('✅ Seed com BLOB concluído!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })