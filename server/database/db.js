 import mongoose from 'mongoose';
 
 async function connectDb() {  // Match the case from your index.js import
   try {
     await mongoose.connect(process.env.MONGODB_URI, {
       serverSelectionTimeoutMS: 30000,  // Increase from 10s to 30s to give more time for connection
     });
     console.log('✅ MongoDB connected');
   } catch (error) {
     console.error('❌ MongoDB connection error:', error.message);
     process.exit(1);
   }
 }
 
 export { connectDb };