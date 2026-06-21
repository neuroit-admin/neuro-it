const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.systemSetting.findMany()
  console.log("Database Settings:")
  console.log(JSON.stringify(settings, null, 2))
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
