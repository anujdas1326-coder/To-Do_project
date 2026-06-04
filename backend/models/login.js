const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const loginSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Register User
loginSchema.statics.register = async function (
  name,
  email,
  password
) {
  // Check email
  if (!validator.isEmail(email)) {
    throw new Error('Please enter a valid email');
  }

  // Check password length
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 0,
      minUppercase: 0,
      minNumbers: 0,
      minSymbols: 0,
    })
  ) {
    throw new Error(
      'Password must be at least 8 characters long'
    );
  }

  // Check existing user
  const existingUser = await this.findOne({ email });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(
    password,
    salt
  );

  // Create user
  const user = await this.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

// Login User
loginSchema.statics.login = async function (
  email,
  password
) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    throw new Error('Invalid email or password');
  }

  return user;
};

// Get All Users
loginSchema.statics.getAllUsers = async function () {
  return this.find().select('-password');
};

const User = mongoose.model('User', loginSchema);

module.exports = User;