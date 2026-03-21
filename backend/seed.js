require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const logger = require("./utils/logger");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AgniSight");
    logger.info("Connected to MongoDB");

    const demoUsers = [
      {
        name: "Demo Operator",
        email: "operator@boxtrack.internal",
        passwordHash: "demo123",
        role: "operator",
      },
      {
        name: "Demo Manager",
        email: "manager@boxtrack.internal",
        passwordHash: "demo123",
        role: "manager",
      },
      {
        name: "Admin User",
        email: "admin@boxtrack.internal",
        passwordHash: "admin123",
        role: "admin",
      },
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = await User.create(userData);
        logger.info(`✓ Created user: ${userData.email} (${userData.role})`);
      } else {
        logger.info(`✓ User already exists: ${userData.email}`);
      }
    }

    logger.info("Database seeding complete!");
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
