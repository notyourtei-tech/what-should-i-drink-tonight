const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@tonightdrink.ai' },
    update: {},
    create: {
      name: '调酒爱好者',
      email: 'demo@tonightdrink.ai',
      password: hashedPassword,
    },
  });

  console.log('Created demo user:', user.email);

  // Create sample inventory
  const inventoryItems = [
    { category: 'alcohol', name: '威士忌', brand: '杰克丹尼', quantity: 700, unit: 'ml' },
    { category: 'alcohol', name: '金酒', brand: '哥顿', quantity: 700, unit: 'ml' },
    { category: 'alcohol', name: '伏特加', brand: '绝对', quantity: 700, unit: 'ml' },
    { category: 'mixer', name: '可乐', quantity: 1, unit: 'pcs' },
    { category: 'mixer', name: '汤力水', quantity: 4, unit: 'pcs' },
    { category: 'mixer', name: '柠檬', quantity: 3, unit: 'pcs' },
    { category: 'mixer', name: '苏打水', quantity: 4, unit: 'pcs' },
    { category: 'mixer', name: '冰块', quantity: 1, unit: 'bag' },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({
      data: {
        userId: user.id,
        ...item,
      },
    });
  }

  console.log('Created sample inventory items');

  // Create sample favorites
  const favorites = [
    { drinkName: '自由古巴', drinkId: 'whisky-coke' },
    { drinkName: '金汤力', drinkId: 'gin-tonic' },
    { drinkName: 'Highball', drinkId: 'highball' },
  ];

  for (const fav of favorites) {
    await prisma.favorite.create({
      data: {
        userId: user.id,
        ...fav,
      },
    });
  }

  console.log('Created sample favorites');

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
