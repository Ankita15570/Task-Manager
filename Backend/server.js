require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/UserRoutes');
const taskRoutes = require('./routes/TaskRoutes');
const reportRoutes = require('./routes/ReportRoutes')

const app = express();

// Middlware to handle to cors
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods:['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders:['Content-Type','Authorization'],
    })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// ConnectDB
connectDB();

// Route
app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes)
app.use('/api/tasks', taskRoutes);
app.use('/api/user', userRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: "Internal server error", error: err.message });
});

app.use("/upload-image", express.static(path.join(__dirname, "uploads")));

// Start servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));