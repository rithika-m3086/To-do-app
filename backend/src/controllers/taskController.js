const Task = require('../models/Task');

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.userId });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, category, dateTime, deadline, priority, subTasks } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      owner: req.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      category: category ? category.trim() : 'Work',
      dateTime: dateTime ? new Date(dateTime) : new Date(),
      deadline: deadline ? new Date(deadline) : undefined,
      priority: priority || 'medium',
      status: 'pending',
      subTasks: Array.isArray(subTasks) ? subTasks : [],
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Server error creating task' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, category, dateTime, deadline, priority, status, subTasks } = req.body;

    const task = await Task.findOne({ _id: taskId, owner: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (category !== undefined) task.category = category.trim();
    if (dateTime !== undefined) task.dateTime = new Date(dateTime);
    if (deadline !== undefined) task.deadline = new Date(deadline);
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (subTasks !== undefined && Array.isArray(subTasks)) task.subTasks = subTasks;

    const updatedTask = await task.save();
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findOneAndDelete({ _id: taskId, owner: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error deleting task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
