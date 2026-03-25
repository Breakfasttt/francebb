import { PrismaClient } from '../prisma/generated-client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const config = { url: "file:./dev.db" }
const adapter = new PrismaLibSql(config)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('--- Verification du Schema ---')
  
  const userId = "user_test_breakyt"
  let user = await prisma.user.findUnique({ where: { id: userId } })
  
  if (!user) {
    console.log('Création de l\'utilisateur de test...')
    user = await prisma.user.create({
      data: {
        id: userId,
        name: "Breakyt",
        email: "breakyt@bbfrance.fr"
      }
    })
  }

  console.log(`Test pour l'utilisateur: ${user.name} (${user.id})`)

  // 1. Créer un message privé
  try {
    const pm = await prisma.privateMessage.create({
      data: {
        senderId: user.id,
        receiverId: user.id,
        subject: 'Test Widget',
        content: 'Ceci est un message de test pour le widget.'
      }
    })
    console.log('Message privé créé:', pm.id)
  } catch (e: any) {
    console.error('Erreur création PM:', e.message)
  }

  // 2. Vérifier le count
  const count = await prisma.privateMessage.count({
    where: { receiverId: user.id, readAt: null }
  })
  console.log('Nombre de messages non lus:', count)

  // 3. Vérifier unread topics
  const topics = await prisma.topic.findMany({
    take: 3,
    include: {
      _count: { select: { posts: true } }
    }
  })
  console.log('Top topics:', topics.map(t => t.title))
  
  // 4. Test aléatoire
  const randomSkip = Math.floor(Math.random() * (topics.length || 1))
  const randomTopic = await prisma.topic.findFirst({ skip: randomSkip })
  console.log('Topic aléatoire choisi:', randomTopic?.title)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
