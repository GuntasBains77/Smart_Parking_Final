const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Unique User ID
  name: { type: String, required: true }, // Name of the user
  phone: { type: String, required: true, unique: true }, // Phone number of the user
  email: { type: String, unique: true }, // Email of the user (optional)
  createdAt: { type: Date, default: Date.now }, // Record the date of creation
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
