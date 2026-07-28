import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error(
      "[db] MONGO_URI is not set. Add your MongoDB Atlas connection string to server/.env"
    );
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    // Don't log the full URI — it contains the DB password
    console.log("[db] connected to MongoDB Atlas");
  } catch (err) {
    console.error("[db] connection failed:", err.message);
    process.exit(1);
  }
}

export default connectDB;
