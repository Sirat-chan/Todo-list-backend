const mongoose = require('mongoose');

const Schema = mongoose.Schema;

    const todoSchema = new Schema({
        content: { type: String, required: true},
        completed: { type: Boolean, required: true},
        user: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User'}]
    })

module.exports = mongoose.model('Todo', todoSchema);