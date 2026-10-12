import mongoose from "mongoose";
import bcrypt from "bcryptjs";

await mongoose.connect(process.env.MONGODB_URI);
const users = mongoose.connection.collection("users");

const email = "admin@admin.com";

// kono admin age theke thakle kichu korbe na
const existingAdmin = await users.findOne({ role: "admin" });

if (existingAdmin) {
  console.log("Admin already ache (" + existingAdmin.email + "), kichu change kora hoyni");
} else {
  const now = new Date();
  await users.insertOne({
    firstName: "admin",
    lastName:"",
    email,
    password: await bcrypt.hash("12345678", 10),
    role: "admin",
    createdAt: now,
    updatedAt: now,
  });
  console.log("Admin created:", email);
}

await mongoose.disconnect();