import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAdmin() {
  const email = process.env.ADMIN_EMAIL || 'your-email@domain.com'; // Replace with your email
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { is_admin: true }
    });
    
    console.log(`✅ Made ${email} an admin`);
    console.log('User:', user.name || user.email);
  } catch (error) {
    if (error.code === 'P2025') {
      console.log(`❌ User with email ${email} not found. Please register first.`);
    } else {
      console.error('Error:', error);
    }
  }
}

setupAdmin()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });
