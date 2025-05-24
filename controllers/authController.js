const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');

const signup = async (req, res) => {
  try {
    const { email, password, displayName, familyPassword } = req.body;

    if (familyPassword !== process.env.FAMILY_PASSWORD) {
      return res.status(403).json({ message: 'Invalid family password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      passwordHash,
      displayName,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Respond with token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { displayName, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (displayName !== undefined) user.displayName = displayName;

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      user.passwordHash = passwordHash;
    }

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all photos uploaded by this user
    const photos = await Photo.find({ uploadedBy: userId });

    // Delete photo files from disk
    photos.forEach(photo => {
      const filePath = path.resolve(photo.url);
      fs.unlink(filePath, err => {
        if (err) {
          console.warn(`Failed to delete file: ${filePath}`, err.message);
        }
      });
    });

    // Delete all photo documents
    await Photo.deleteMany({ uploadedBy: userId });

    // Delete user document
    await User.deleteOne({ _id: userId });

    res.status(200).json({ message: 'User and photos deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

module.exports = {
  signup,
  login,
  updateUser,
  deleteUser,
};
