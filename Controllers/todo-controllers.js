const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const Todo = require('../models/todo');
const User = require('../models/user')
const mongoose = require("mongoose");
const getTodoByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let userWithTodos;
    try {
        userWithTodos = await User.findById(userId).populate('todos');
    } catch (err) {
        const error = new HttpError(
            'Fetching todos failed, please try again later',
            500
        );
        return next(error);
    }

    if (!userWithTodos || userWithTodos.todos.length === 0) {
        return next(
            new HttpError('Could not find todos for the provided user id.', 404)
        );
    }

    res.json({
        todos: userWithTodos.todos.map(todo =>
            todo.toObject({ getters: true })
        )
    });
};

const createTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const { content, userId } = req.body;
    const createdTodo = new Todo({
        content,
        completed: false,
        user: userId
    });
    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        console.log(err)
        const error = new HttpError('Creating todo failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdTodo.save({ session: sess });
        user.todos.push(createdTodo);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating todo failed, please try again.',
            500
        );
        return next(error);
    }
    res.status(201).json({ todo: createdTodo });
};

const updateTodo = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const{content} = req.body;
    const todoId = req.params.tid;

    let todo;
    try{
        todo = await Todo.findById(todoId);
        console.log(todo)
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update todo.' , 500
        );
        return next (error);
    }
    todo.content = content;
    try{
        await todo.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, Could not update todo', 500
        );
        return next(error);
    }
    res.status(200).json({ todo: todo.toObject({ getters: true}) });
};

const deleteTodo = async (req, res, next) => {
    const todoId = req.params.tid;

    let todo;
    try {
        todo = await Todo.findById(todoId).populate('user');
        if (!todo) {
            const error = new HttpError('Todo not found', 404);
            return next(error);
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Something went wrong, could not delete todo.',
            500
        );
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await Todo.deleteOne({ _id: todoId }, { session: sess });

        await User.findOneAndUpdate(
            { _id: todo.user._id },
            { $pull: { todos: todoId } },
            { session: sess }
        );

        await sess.commitTransaction();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Something went wrong, could not delete todo.',
            500
        );
        return next(error);
    }

    res.status(200).json({ message: 'Deleted todo' });
}

exports.getTodoByUserId = getTodoByUserId;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
