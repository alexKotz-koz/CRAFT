const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const NotificationSchema = require('./Notification');

const UserSchema = new Schema({
  googleId: String,
  username: { type: String, required: true, index: { unique: true } },
  password: String,
  //firstName: { type: String, required: true }, --Later implementation
  //lastName: String, --Later implementation
  email: { type: String, required: true, index: { unique: true } },
  role: {
    type: String,
    enum: ['facilitator', 'participant', 'admin'],
    required: true
  },
  notifications: { type: [NotificationSchema], required: true, default: [] },
  avatar: { type: String },
});



mongoose.model('User', UserSchema);