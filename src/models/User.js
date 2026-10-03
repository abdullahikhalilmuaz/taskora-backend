const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ['admin', 'employee'], default: 'employee' },
    department: { type: String, required: true },
    employeeId: { type: String, unique: true, sparse: true },
    designation: { type: String, default: 'Staff' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
