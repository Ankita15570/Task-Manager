const mongoose = require("mongoose");
const Task = require("../models/Task");

const getChecklistState = (
  todoCheckList = [],
  currentStatus = "Pending",
  currentProgress = 0,
) => {
  const completedCount = todoCheckList.filter((item) => item.completed).length;
  const totalCount = todoCheckList.length;

  if (!totalCount) {
    return { status: currentStatus, progress: currentProgress, completedCount };
  }

  const progress = Math.round((completedCount / totalCount) * 100);
  const status =
    completedCount === totalCount
      ? "Completed"
      : completedCount > 0
        ? "In Progress"
        : "Pending";

  return { status, progress, completedCount };
};

const syncTaskChecklistState = (task) => {
  const state = getChecklistState(
    task.todoCheckList,
    task.status,
    task.progress,
  );
  task.status = state.status;
  task.progress = state.progress;
};

const buildDashboardSnapshot = (taskRecords) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tasks = taskRecords.map((task) => {
    const state = getChecklistState(
      task.todoCheckList || [],
      task.status,
      task.progress,
    );
    return { ...task, status: state.status, progress: state.progress };
  });

  const snapshot = {
    statistics: {
      totalTask: tasks.length,
      pendingTask: 0,
      completeTask: 0,
      overdueTask: 0,
    },
    charts: {
      taskDistribution: {
        All: tasks.length,
        Pending: 0,
        InProgress: 0,
        Completed: 0,
      },
      taskPriorityLevel: { low: 0, medium: 0, high: 0 },
    },
    recentTasks: tasks.slice(0, 10),
  };

  tasks.forEach((task) => {
    if (task.status === "Pending") {
      snapshot.statistics.pendingTask += 1;
      snapshot.charts.taskDistribution.Pending += 1;
    } else if (task.status === "In Progress") {
      snapshot.charts.taskDistribution.InProgress += 1;
    } else if (task.status === "Completed") {
      snapshot.statistics.completeTask += 1;
      snapshot.charts.taskDistribution.Completed += 1;
    }

    if (Object.hasOwn(snapshot.charts.taskPriorityLevel, task.priority)) {
      snapshot.charts.taskPriorityLevel[task.priority] += 1;
    }

    const dueDate =
      typeof task.dueDate === "string" ? task.dueDate.slice(0, 10) : "";
    if (task.status !== "Completed" && dueDate && dueDate < today) {
      snapshot.statistics.overdueTask += 1;
    }
  });

  return snapshot;
};

//@desc     GET all task (Admin: all, User: only assign task)
// @route   GET/api/tasks/
//@access   Private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter =
      req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const taskRecords = await Task.find(filter).populate(
      "assignedTo",
      "name email profileImageUrl",
    );

    const normalizedTasks = taskRecords.map((task) => {
      const state = getChecklistState(
        task.todoCheckList,
        task.status,
        task.progress,
      );
      return {
        ...task._doc,
        status: state.status,
        progress: state.progress,
        completedTodoCount: state.completedCount,
      };
    });
    const tasks = status
      ? normalizedTasks.filter((task) => task.status === status)
      : normalizedTasks;

    const statusSummary = normalizedTasks.reduce(
      (summary, task) => {
        if (task.status === "Pending") summary.pendingTask += 1;
        if (task.status === "In Progress") summary.inProgressTask += 1;
        if (task.status === "Completed") summary.completedTask += 1;
        return summary;
      },
      {
        all: normalizedTasks.length,
        pendingTask: 0,
        inProgressTask: 0,
        completedTask: 0,
      },
    );

    res.json({
      tasks,
      statusSummary,
    });
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};

//@desc     GET task ID
//@route    GET/api/tasks/:id
//@access   Private
const getTasksById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );

    if (!task) return res.status(404).json({ message: "Task is not found" });
    const state = getChecklistState(
      task.todoCheckList,
      task.status,
      task.progress,
    );
    task.status = state.status;
    task.progress = state.progress;
    res.json(task);
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};

//@desc     Create a new task
//@route    POST/api/tasks/
//@access   Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachment,
      todoCheckList,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !dueDate) {
      return res
        .status(400)
        .json({ message: "title, description, and dueDate are required" });
    }

    if (
      req.user.role === "admin" &&
      assignedTo !== undefined &&
      !Array.isArray(assignedTo)
    ) {
      return res
        .status(400)
        .json({ message: "assignedTo must be an array of user ID's" });
    }

    const taskAssignees =
      req.user.role === "admin"
        ? Array.isArray(assignedTo)
          ? assignedTo
          : []
        : [req.user._id];

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      assignedTo: taskAssignees,
      createdBy: req.user._id,
      todoCheckList: Array.isArray(todoCheckList) ? todoCheckList : [],
      attachment: Array.isArray(attachment) ? attachment : [],
    });
    syncTaskChecklistState(task);
    await task.save();
    return res.status(200).json({ message: "Task created successfully", task });
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};

//@desc     Update the task details
//@route    PUT/api/tasks/:id
//@access   Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "task is not found" });

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
    task.attachment = req.body.attachment || task.attachment;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res
          .status(400)
          .json({ message: "assignedTo must be an array of user IDs" });
      }
      task.assignedTo = req.body.assignedTo;
    }
    syncTaskChecklistState(task);
    const updateTask = await task.save();
    return res.status(201).json({ message: "Task update", updateTask });
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};

//@desc     delete the task details
//@route    DELETE/api/tasks/:id
//@access   Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(400).json({ message: "Task is not found" });
    }

    await task.deleteOne();
    return res.status(200).json({ message: "task deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};

//@desc     update the task status
//@route    PUT /api/tasks/:id/status
//@access   Private
const updateTaskStatus = async (req, res) => {
  try {
    const allowedStatuses = ["Pending", "In Progress", "Completed"];
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid task status" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) return res.status(400).json({ message: "Task is not found" });

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "not authorized " });
    }

    task.status = req.body.status || task.status;

    if (task.status == "Completed") {
      task.todoCheckList = task.todoCheckList || [];
      task.todoCheckList.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    await task.save();
    res.json({ message: "Task status update", task });
  } catch (error) {
    return res.status(500).json({ message: "internal server isssue" });
  }
};
//@desc     update the task checklist
//@route    PUT /api/task/:id/todo
//access    Private
const updateTaskChecklist = async (req, res) => {
  try {
    const { todoCheckList } = req.body;
    if (!Array.isArray(todoCheckList)) {
      return res
        .status(400)
        .json({ message: "todoCheckList must be an array" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(400).json({ message: "Task not found" });
    }

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString(),
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "not authorized " });
    }

    task.todoCheckList = todoCheckList;

    syncTaskChecklistState(task);

    await task.save();
    const updateTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl",
    );

    res.json({
      message: "Task checklist is update successfully",
      task: updateTask,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ messaage: "internal server issue" });
  }
};
//@desc     get dashboard data (Admin only)
//@route    GET /api/tasks/dashborad-data
//@access   Private
const getDashboardData = async (req, res) => {
  try {
    const taskRecords = await Task.find()
      .sort({ createdAt: -1 })
      .select("title status priority dueDate createdAt todoCheckList progress")
      .lean();
    res.status(200).json(buildDashboardSnapshot(taskRecords));
  } catch (error) {
    return res.status(500).json({ message: "internal sever issue" });
  }
};

//@desc     get dashboard user data
//@route    GET /api/tasks/user-dashborad-data
//@access   Private
const getUserDashboardData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(String(req.user._id));
    const taskRecords = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .select("title status priority dueDate createdAt todoCheckList progress")
      .lean();
    res.status(200).json(buildDashboardSnapshot(taskRecords));
  } catch (error) {
    return res.status(500).json({ message: "internal server issue" });
  }
};
module.exports = {
  getTasks,
  getTasksById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
