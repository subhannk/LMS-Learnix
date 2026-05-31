const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected (Atlas): ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Atlas connection failed: ${error.message}`);
    console.log('🔄 Attempting local MongoDB fallback connection...');
    try {
      const localUri = 'mongodb://127.0.0.1:27017/lms';
      const conn = await mongoose.connect(localUri);
      console.log(`✅ MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localError) {
      console.error(`❌ Local connection failed: ${localError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;