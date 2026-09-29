const Task = require('../models/Task');
const User = require('../models/Users');
const excelJS = require('exceljs');

//@desc     Export all Task as an excel file
//@route    GET /api/reports/export/tasks
//@access   Private (Admin)
const exportTaskReport = async(req, res) => {
    try{

        const tasks = await Task.find().populate('assignedTo', 'name email');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Task report');

        worksheet.columns = [
            {header: 'TaskId', key: '_id', width: 25},
            {header: 'Title', key: 'title', width: 30},
            {header: 'Description', key: 'description', width: 50},
            {header: 'Priority', key: 'priority', width: 15},
            {header: 'Status', key: 'status', width: 20},
            {header: 'Created date', key: 'createdAt', width: 20},
            {header: 'Due date', key: 'dueDate', width: 20},
            {header: 'Assigned To', key: 'assignedTo', width: 20},
            {header: 'Checklist progress', key: 'checklistProgress', width: 25},
            {header: 'Attachments', key: 'attachments', width: 40},
        ];

        tasks.forEach((task) =>{
            const assignedTo = (task.assignedTo || [])
                .filter((user) => user)
                .map((user)=> `${user.name} (${user.email})`)
                .join(", ");
            const checklist = task.todoCheckList || [];
            const completedChecklist = checklist.filter((item) => item.completed).length;
            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description || "",
                priority: task.priority,
                status: task.status,
                createdAt: task.createdAt ? new Date(task.createdAt).toISOString().split("T")[0] : "",
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
                assignedTo: assignedTo || 'Unassigned',
                checklistProgress: checklist.length ? `${completedChecklist}/${checklist.length} completed` : "No checklist",
                attachments: (task.attachment || []).join(", "),
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.xlsx"');

        await workbook.xlsx.write(res);
        res.end();

    }catch(error){
        return res.status(500).json({message: "internal server issue"})
    }
}

//@desc     Export all users as an excel file
//@route    GET /api/reports/export/users
//@access   Private (Admin)
const exportUserReport = async(req, res) => {
    try{

        const user = await User.find().select('name email _id').lean();
        const Usertasks = await Task.find().populate('assignedTo', 'name email');

        const userTaskMap = {};
        user.forEach((user) =>{
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTask: 0,
                inProgressTask: 0,
                completedTask: 0,
            };
        });
        
        Usertasks.forEach((task)=>{
            if(task.assignedTo){
                task.assignedTo.forEach((assignedUser)=> {
                    if(userTaskMap[assignedUser._id]){
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if(task.status == 'Pending'){
                            userTaskMap[assignedUser._id].pendingTask += 1;
                        }else if(task.status == 'In Progress'){
                            userTaskMap[assignedUser._id].inProgressTask += 1;
                        }else if(task.status == 'Completed'){
                            userTaskMap[assignedUser._id].completedTask += 1;
                        }
                    }
                })
            }
        })

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('User report');

        worksheet.columns = [
            {header: 'User Name', key: 'name', width: 25},
            {header: 'Email', key: 'email', width: 30},
            {header: 'Total Assigned task', key: 'taskCount', width: 50},
            {header: 'Pending Task', key: 'pendingTask', width: 15},
            {header: 'In Progress Task', key: 'inProgressTask', width: 20},
            {header: 'Completed Tasks', key: 'completedTask', width: 20},
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="users-report.xlsx"');

        await workbook.xlsx.write(res);
        res.end();

    }catch(error){
        return res.status(500).json({message: "internal sever issues"})
    }
}
module.exports = {exportTaskReport, exportUserReport}