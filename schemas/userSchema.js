const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    rank: String,
    permissions: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', schema);