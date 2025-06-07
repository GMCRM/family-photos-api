require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

const swagger = require('./swagger');

const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

const app = express(); // <-- move this before using `app`

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);

const photoRoutes = require('./routes/photos');
app.use('/photos', photoRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Family Photos API is running');
});


// Connect to MongoDB
connectDB();

swagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});