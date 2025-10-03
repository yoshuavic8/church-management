const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMigration() {
  console.log('🧪 Testing migration...');
  
  try {
    // Test creating a district without leaders
    const testDistrict = await prisma.district.create({
      data: {
        id: 'test-district-id',
        name: 'Test District',
        description: 'Test description',
        status: 'active'
      }
    });
    
    console.log('✅ District created successfully:', testDistrict);
    
    // Clean up
    await prisma.district.delete({
      where: { id: 'test-district-id' }
    });
    
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMigration();
