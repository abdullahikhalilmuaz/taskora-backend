require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Task = require('../models/Task');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

const users = [
  { name: 'Admin User', email: 'admin@sumaila.edu', password: 'admin123', userType: 'admin', department: 'Administration', employeeId: 'AD001', designation: 'Administrator', phone: '+2348000000000' },
  { name: 'John Doe', email: 'john@sumaila.edu', password: 'emp123', userType: 'employee', department: 'IT', employeeId: 'EMP001', designation: 'Developer' },
  { name: 'Sarah Wilson', email: 'sarah@sumaila.edu', password: 'emp123', userType: 'employee', department: 'HR', employeeId: 'EMP002', designation: 'Manager' },
  { name: 'Mike Johnson', email: 'mike@sumaila.edu', password: 'emp123', userType: 'employee', department: 'Finance', employeeId: 'EMP003', designation: 'Accountant' },
  { name: 'Emily Davis', email: 'emily@sumaila.edu', password: 'emp123', userType: 'employee', department: 'Marketing', employeeId: 'EMP004', designation: 'Lecturer' },
  { name: 'David Brown', email: 'david@sumaila.edu', password: 'emp123', userType: 'employee', department: 'Operations', employeeId: 'EMP005', designation: 'Officer' },
  { name: 'Lisa Taylor', email: 'lisa@sumaila.edu', password: 'emp123', userType: 'employee', department: 'IT', employeeId: 'EMP006', designation: 'Developer' },
];

const run = async () => {
  await connectDB();
  console.log('Clearing old data...');
  await Promise.all([
    User.deleteMany({}),
    Task.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const created = await User.insertMany(users);
  console.log('Created ' + created.length + ' users');

  const admin = created.find((u) => u.userType === 'admin');
  const john = created.find((u) => u.email === 'john@sumaila.edu');
  const sarah = created.find((u) => u.email === 'sarah@sumaila.edu');
  const mike = created.find((u) => u.email === 'mike@sumaila.edu');
  const emily = created.find((u) => u.email === 'emily@sumaila.edu');
  const david = created.find((u) => u.email === 'david@sumaila.edu');
  const lisa = created.find((u) => u.email === 'lisa@sumaila.edu');

  const now = Date.now();
  const day = 86400000;

  const tasks = [
    { title: 'Website Redesign', description: 'Redesign the company website with a modern and responsive layout.', assignedTo: john._id, priority: 'High', status: 'In Progress', deadline: new Date(now + 2 * day), department: 'IT' },
    { title: 'Database Backup', description: 'Perform full database backup and verify integrity.', assignedTo: sarah._id, priority: 'Medium', status: 'Pending', deadline: new Date(now + 4 * day), department: 'HR' },
    { title: 'Report Generation', description: 'Generate the monthly financial reports.', assignedTo: mike._id, priority: 'Low', status: 'Completed', deadline: new Date(now - 2 * day), department: 'Finance', completedAt: new Date(now - 2 * day) },
    { title: 'UI Improvements', description: 'Polish existing UI and fix alignment issues.', assignedTo: emily._id, priority: 'High', status: 'In Progress', deadline: new Date(now + 1 * day), department: 'Marketing' },
    { title: 'Security Update', description: 'Apply the latest security patches to the server.', assignedTo: david._id, priority: 'Medium', status: 'Pending', deadline: new Date(now + 3 * day), department: 'Operations' },
    { title: 'API Integration', description: 'Integrate the new payment API.', assignedTo: lisa._id, priority: 'High', status: 'On Hold', deadline: new Date(now + 6 * day), department: 'IT' },
    { title: 'Marketing Campaign', description: 'Plan and launch the new marketing campaign.', assignedTo: emily._id, priority: 'Medium', status: 'Pending', deadline: new Date(now + 7 * day), department: 'Marketing' },
    { title: 'Client Meeting', description: 'Prepare slides for the client meeting.', assignedTo: sarah._id, priority: 'Low', status: 'Completed', deadline: new Date(now - 5 * day), department: 'HR', completedAt: new Date(now - 5 * day) },
  ];

  const createdTasks = await Task.insertMany(
    tasks.map((t) => ({
      ...t,
      createdBy: admin._id,
      history: [{ action: 'created', userId: admin._id, userName: admin.name, newValue: 'Task created' }],
    }))
  );

  console.log('Created ' + createdTasks.length + ' tasks');

  // Sample chat messages
  await Message.insertMany([
    { taskId: createdTasks[0]._id, senderId: admin._id, senderName: admin.name, text: 'Task assigned to John Doe.' },
    { taskId: createdTasks[0]._id, senderId: john._id, senderName: john.name, text: 'Starting work on the frontend.' },
    { taskId: createdTasks[0]._id, senderId: sarah._id, senderName: sarah.name, text: 'This looks great! Will handle the design files.' },
  ]);

  console.log('====================================================');
  console.log(' SEED COMPLETE');
  console.log('====================================================');
  console.log(' Admin  : admin@sumaila.edu  / admin123');
  console.log(' John   : john@sumaila.edu   / emp123');
  console.log(' Sarah  : sarah@sumaila.edu  / emp123');
  console.log(' Mike   : mike@sumaila.edu   / emp123');
  console.log(' Emily  : emily@sumaila.edu  / emp123');
  console.log(' David  : david@sumaila.edu  / emp123');
  console.log(' Lisa   : lisa@sumaila.edu   / emp123');
  console.log('====================================================');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
