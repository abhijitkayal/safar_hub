import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

let connectionPromise: Promise<void | mongoose.Connection> | null = null;
let isInitialized = false;

export default async function dbConnect() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // Connection in progress started elsewhere
  if (mongoose.connection.readyState === 2 && connectionPromise === null) {
    connectionPromise = mongoose.connection.asPromise().finally(() => {
      connectionPromise = null;
    });
  }

  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable command buffering
    })
    .then(async (mongooseInstance) => {
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${mongooseInstance.connection.db.databaseName}`);
      
      // Initialize collections on first connection
      if (!isInitialized) {
        const { initializeCollections } = await import("@/lib/db/initCollections");
        await initializeCollections();
        isInitialized = true;
      }
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error.message);
      console.error("Error details:", {
        name: error.name,
        code: error.code,
        codeName: error.codeName,
      });
      
      // Provide helpful error messages
      if (error.message.includes("authentication failed")) {
        console.error("💡 Check your MongoDB username and password in .env.local");
      } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
        console.error("💡 Check your internet connection and MongoDB cluster URL");
      } else if (error.message.includes("IP") || error.message.includes("whitelist")) {
        console.error("💡 Add your IP address to MongoDB Atlas Network Access whitelist");
      }
      
      throw error; // Throw the original error with details
    })
    .finally(() => {
      connectionPromise = null;
    });

  await connectionPromise;
}