const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        require: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
});

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true,
        },
        description: {
            type: String,
        },
        priority: {
            type: String,
            enum:['low', 'medium', 'high'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending'
        },
        dueDate: {
            type: String,
            require: true,
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId, ref:'Users'
            }
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Users'
        },
        attachment: [
            {
                type: String
            }
        ],
        todoCheckList: [
            todoSchema
        ],
        progress: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Task', taskSchema)