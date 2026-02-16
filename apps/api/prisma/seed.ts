import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as bcrypt from 'bcrypt'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')

  // Create default gym
  const gym = await prisma.gym.create({
    data: {
      name: 'My Gym',
      address: '123 Main Street',
      phone: '+1234567890',
    },
  })

  console.log(`✓ Gym created: ${gym.name} (ID: ${gym.id})`)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@gym.local',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      gymId: gym.id,
    },
  })

  console.log(`✓ Admin user created: ${admin.email} (ID: ${admin.id})`)

  // Create sample subscription plans
  const plans = [
    { name: 'Monthly', description: 'Monthly membership', durationDays: 30, price: 50 },
    { name: 'Quarterly', description: '3-month membership', durationDays: 90, price: 120 },
    { name: 'Annual', description: 'Full year membership', durationDays: 365, price: 400 },
  ]

  for (const plan of plans) {
    const created = await prisma.subscriptionPlan.create({
      data: {
        name: plan.name,
        description: plan.description,
        durationDays: plan.durationDays,
        price: plan.price,
        gymId: gym.id,
      },
    })
    console.log(`✓ Plan created: ${created.name} - $${plan.price} (ID: ${created.id})`)
  }

  console.log('\n✅ Seed completed!')
  console.log('📧 Login with: admin@gym.local / admin123')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
