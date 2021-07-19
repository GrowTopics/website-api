const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    shopper: String,
    worker: String,
    orderType: String,
    orderId: String,
    world: String,
    password: String,
    notes: String
});

module.exports = mongoose.model('Order', schema);