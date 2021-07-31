const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const schema = new mongoose.Schema({
    id: Number,
    status: Number,
    topic: String,
    text: String,
    writer: String,
    editor: String,
    manager: String
});

schema.plugin(autoIncrement.plugin, { model: 'Book', field: 'id' });

module.exports = mongoose.model('Blog', schema);