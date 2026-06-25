const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const{
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
} = require('../controllers/todocontroller');

router.get('/', authMiddleware, getTodos);
router.post('/', authMiddleware, createTodo);
router.get('/:id', authMiddleware, getTodoById);
router.put('/:id', authMiddleware, updateTodo);
router.delete('/:id', authMiddleware, deleteTodo);

module.exports = router;