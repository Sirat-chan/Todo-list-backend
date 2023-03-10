const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    todos: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Todo'}]
});

const User = mongoose.model('User', userSchema);



module.exports = mongoose.model('User', userSchema);