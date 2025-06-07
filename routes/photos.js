const express = require('express');
const router = express.Router();

const { uploadPhoto, getPhotos, deletePhoto, updatePhoto } = require('../controllers/photoController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


/**
 * @swagger
 * /photos:
 *   post:
 *     summary: Upload a photo
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *               caption:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 */
router.post('/', verifyToken, upload.single('photo'), uploadPhoto);

/**
 * @swagger
 * /photos:
 *   get:
 *     summary: Get all photos uploaded by the logged-in user
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user photos
 */
router.get('/', verifyToken, getPhotos);

/**
 * @swagger
 * /photos/{id}:
 *   delete:
 *     summary: Delete a photo by ID
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Photo ID to delete
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 */
router.delete('/:id', verifyToken, deletePhoto);

/**
 * @swagger
 * /photos/{id}:
 *   put:
 *     summary: Update a photo by ID
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Photo ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               visibility:
 *                 type: string
 *     responses:
 *       200:
 *         description: Photo updated successfully
 */
router.put('/:id', verifyToken, updatePhoto);

module.exports = router;