const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    seq: Number
});

module.exports = mongoose.model('Counter', schema);

