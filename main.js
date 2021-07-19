// MongoDB stuff
const mongoose = require('mongoose');
mongoose.connect('mongodb://dbgt:CSZtni4ESQkVkI9hlSow0TQgQ7HoEJyNnV3Pn6Er2HXEnCuZsdzAoDKrsiyC9Pndy3C328looSstaVWkDpfpgQ==@dbgt.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@dbgt@', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

// MongoDB Schemas
const userSchema = require('./userSchema');
const orderSchema = require('./orderSchema');

// Express and everything related to express
const cookieparser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));

// Test app.post with - curl -d "example=example" -X POST url

// Order endpoint
app.post('/api/order', (req, res) => {
    try {
        const body = req.body;
        console.log(body);
        const order = new orderSchema({ shopper: body.shopper, worker: body.worker, orderType: body.orderType, orderId: body.orderId, world: body.world, password: body.password, notes: body.notes });
        order.save();
        res.status(200);
    } catch (e) {
        console.log(e);
        res.status(500);
    }
});


// Make sure we are connected to the db and if so run the API
var port = 5000;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connection has been acheived, Running API');
    app.listen(port);
});