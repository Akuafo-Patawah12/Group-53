const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  role: { type: String, enum: ['Worker', 'Supervisor','Foreman','Clerk','Lasher'], required: true },
  email: { type: String, required: true, unique: true },
  group:{type:String,enum:['A','B','C'],required:true},
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
