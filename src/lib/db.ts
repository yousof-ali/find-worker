import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env.local");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// global e rakhi jate hot reload e connection reset na hoy
const globalWithCache = global as typeof globalThis & { mongooseCache?: MongooseCache };
const cached: MongooseCache = (globalWithCache.mongooseCache ??= { conn: null, promise: null });

export default async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string, { bufferCommands: false })
      .catch((err) => {
        cached.promise = null; // porer request e abar try korte parbe
        console.error("❌ MongoDB connection failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// purano naam diye import kora jaygagulo na bhange
export const connectDB = dbConnect;