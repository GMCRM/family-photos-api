const fs = require('fs');
const path = require('path');
const Photo = require('../models/Photo');
const cloudinary = require('../config/cloudinary');

const uploadPhoto = async (req, res) => {
  try {
    const { caption, tags, visibility } = req.body;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newPhoto = new Photo({
      uploadedBy: req.user.userId,
      url: req.file.path, // this will be the Cloudinary URL
      caption,
      tags,
      visibility
    });

    await newPhoto.save();

    res.status(201).json({ message: 'Photo uploaded successfully', photo: newPhoto });
  } catch (err) {
    res.status(500).json({ message: 'Photo upload failed', error: err.message });
  }
};

const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find({}).sort({ createdAt: -1 });
    res.status(200).json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve photos', error: err.message });
  }
};

const getUserPhotos = async (req, res) => {
  try {
    const filter = { uploadedBy: req.user.userId };

    if (req.query.visibility && req.query.visibility !== 'all') {
      filter.visibility = req.query.visibility;
    }

    const photos = await Photo.find(filter).sort({ createdAt: -1 });
    res.status(200).json(photos);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve photos', error: err.message });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    if (photo.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this photo' });
    }

    // Extract public ID from Cloudinary URL
    const segments = photo.url.split('/');
    const publicIdWithExtension = segments[segments.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];

    // Attempt to delete from Cloudinary
    await cloudinary.uploader.destroy(`family-photos/${publicId}`);

    // Delete photo document
    await photo.deleteOne();

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete photo', error: err.message });
  }
};

const updatePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    if (photo.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this photo' });
    }

    const { caption, tags, visibility } = req.body;

    if (caption !== undefined) photo.caption = caption;
    if (tags !== undefined) photo.tags = tags;
    if (visibility !== undefined) photo.visibility = visibility;

    await photo.save();

    res.status(200).json({ message: 'Photo updated successfully', photo });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update photo', error: err.message });
  }
};

module.exports = { uploadPhoto, getUserPhotos, getPhotos, deletePhoto, updatePhoto };
