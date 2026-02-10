const mongoose = require('mongoose');
require('dotenv').config();

async function fixPhoneIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Drop the existing phone index
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Dropped old phone_1 index');
    } catch (error) {
      console.log('ℹ️  phone_1 index does not exist or already dropped');
    }

    // Create new sparse index without unique constraint
    await collection.createIndex({ phone: 1 }, { sparse: true });
    console.log('✅ Created new sparse phone index');

    console.log('\n✅ Phone index fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing phone index:', error);
    process.exit(1);
  }
}

fixPhoneIndex();
