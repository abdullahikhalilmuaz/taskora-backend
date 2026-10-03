const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const seedUsers = [
  // Admin user
  {
    name: "Admin User",
    email: "admin@sumaila.edu",
    password: "admin123",
    userType: "admin",
    department: "Administration",
    employeeId: "AD001",
    designation: "System Administrator",
    isActive: true,
  },
  // Employee 1 - Computer Science
  {
    name: "Ahmed Ibrahim",
    email: "ahmed@cs.sumaila.edu",
    password: "emp123",
    userType: "employee",
    department: "Computer Science",
    employeeId: "CS045",
    designation: "Lecturer",
    isActive: true,
  },
  // Employee 2 - Computer Science
  {
    name: "Fatima Usman",
    email: "fatima@cs.sumaila.edu",
    password: "emp123",
    userType: "employee",
    department: "Computer Science",
    employeeId: "CS046",
    designation: "Graduate Assistant",
    isActive: true,
  },
  // Employee 3 - Administration
  {
    name: "Musa Abdullahi",
    email: "musa@admin.sumaila.edu",
    password: "emp123",
    userType: "employee",
    department: "Administration",
    employeeId: "AD023",
    designation: "Administrative Officer",
    isActive: true,
  },
  // Employee 4 - Business Administration
  {
    name: "Aisha Bello",
    email: "aisha@bus.sumaila.edu",
    password: "emp123",
    userType: "employee",
    department: "Business Administration",
    employeeId: "BA012",
    designation: "Senior Lecturer",
    isActive: true,
  },
  // Employee 5 - Engineering
  {
    name: "Ibrahim Mohammed",
    email: "ibrahim@eng.sumaila.edu",
    password: "emp123",
    userType: "employee",
    department: "Engineering",
    employeeId: "ENG008",
    designation: "Professor",
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/Taskora",
    );
    console.log("✅ Connected to MongoDB");

    // Clear existing users
    await User.deleteMany({});
    console.log("✅ Cleared existing users");

    // Insert new users
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`✅ Created ${createdUsers.length} demo users successfully`);

    console.log("\n📋 Demo Credentials:");
    console.log("====================");
    seedUsers.forEach((user) => {
      console.log(
        `📧 ${user.email} | 🔑 ${user.password} | 👤 ${user.userType} | 🏢 ${user.department}`,
      );
    });

    console.log("\n✅ Database seeding completed!");

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
