const Task = require('../models/Task');
const User = require('../models/Users');
const bcrypt = require('bcryptjs')

//@desc     Get all Users(Admin only)
//@route    Get /api/users/
//@access   Private(Admin)
const getUser = async (req, res) => {
    try {
        const users = await User.find({ role: 'member'}).select('-password');

        // Add task count to each Users 
        const usersWithTaskCount = await Promise.all(users.map(async (user) => {
        const pendingTask = await Task.countDocuments
        ({ 
            assignedTo: user._id, 
            status: 'Pending'
        });
        const inProgressTask = await Task.countDocuments
        ({ 
            assignedTo: user._id, 
            status: 'In Progress'
        });
        const completedTask = await Task.countDocuments
        ({ 
            assignedTo: user._id, 
            status: 'Completed'
        });

        return {
            ...user._doc, // Include all existing user
            pendingTask,
            inProgressTask,
            completedTask,
        }
        }));

        res.json(usersWithTaskCount);
    } catch (error) {
        return res.status(500).json({ message: "Server issue", error:error.message})
    }
}

//@desc     Get user by Id
//@route    GET/api/users/:id
//@access   Private
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;   
        const user = await User.findById(userId);

        if (!user) {                     
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);      
    } catch (error) {
        return res.status(500).json({ message: "Server issue", error: error.message });
    }
};

module.exports = {getUser, getUserById}