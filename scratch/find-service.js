const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.service.findFirst({
  where: { isActive: true }
})
  .then(s => console.log(JSON.stringify(s)))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
