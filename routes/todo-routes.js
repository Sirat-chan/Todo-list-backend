const express = require('express');
const {check} = require('express-validator');
const todoControllers = require('../controllers/todo-controllers');

const router = express.Router();


router.get('/user/:uid', todoControllers.getTodoByUserId);

router.post(
    '/create-todo',
    [
        check('content')
            .not()
            .isEmpty()
    ],
    todoControllers.createTodo);

router.patch(
    '/update-todo/:tid',
    [
        check('content')
            .not()
            .isEmpty()
    ],
    todoControllers.updateTodo);

router.delete(
    '/delete-todo/:tid',
   todoControllers.deleteTodo);

module.exports = router;
