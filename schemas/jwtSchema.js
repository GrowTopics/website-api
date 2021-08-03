const mongoose = require('mongoose');

const schema = new mongoose.Schema({
   username: String,
   jwttokens: Array
});

module.exports = mongoose.model('Jwt', schema);