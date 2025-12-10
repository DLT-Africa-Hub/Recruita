import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3090;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talent-hub', {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000, // 45 seconds
    connectTimeoutMS: 30000, // 30 seconds
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority',
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check if your IP is whitelisted in MongoDB Atlas');
    console.error('   2. Verify your MONGODB_URI connection string is correct');
    console.error('   3. Check your network connection');
    console.error('   4. Ensure MongoDB Atlas cluster is running');
    process.exit(1);
  });

export default app;
