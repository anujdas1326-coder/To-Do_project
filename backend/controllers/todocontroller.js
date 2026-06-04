const Todo = require('../models/todo');

// CREATE TODO
const createTodo = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required',
            });
        }

        const todo = await Todo.createTodo(
            req.user.email, // from JWT middleware
            title,
            description
        );

        return res.status(201).json({
            success: true,
            message: 'Todo created successfully',
            todo,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL TODOS OF USER
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.getTodosByOwner(req.user.email);

        return res.status(200).json({
            success: true,
            count: todos.length,
            todos,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET SINGLE TODO BY ID (only owner can access)
const getTodoById = async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findOne({
            _id: id,
            owner: req.user.email,
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
        }

        return res.status(200).json({
            success: true,
            todo,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE TODO
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findOne({
            _id: id,
            owner: req.user.email,
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Todo updated successfully',
            todo: updatedTodo,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE TODO
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;

        const todo = await Todo.findOneAndDelete({
            _id: id,
            owner: req.user.email,
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Todo deleted successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
};