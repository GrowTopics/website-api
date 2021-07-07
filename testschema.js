const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    name: String,
    password: String,
    email: String
});

module.exports = mongoose.model('Test', schema);