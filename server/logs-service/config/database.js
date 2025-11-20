import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ Logs Service MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Logs Service MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
