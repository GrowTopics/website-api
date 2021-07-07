// Other packages
const jwt = require("jsonwebtoken");
const fs = require('fs');

// MongoDB stuff
const mongoose = require("mongoose");
mongoose.connect('mongodb://dbgt:CSZtni4ESQkVkI9hlSow0TQgQ7HoEJyNnV3Pn6Er2HXEnCuZsdzAoDKrsiyC9Pndy3C328looSstaVWkDpfpgQ==@dbgt.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@dbgt@', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;

// MongoDB schemas
const testSchema = require('./testschema');

// Express and everything related to express
const cookieparser = require('cookie-parser');
const express = require("express");
const app = express();

app.use(cookieparser());

// Adds stuff to the db
app.get('/add', (req, res) => {
    const query = req.query;
    const silence = new testSchema({ name: query.name, password: query.password, email: query.email });
    silence.save();
    res.send(silence.name);
});

// Gets stuff from the db
app.get('/get', async(req, res) => {
    const query = req.query;
    const find = await testSchema.findOne({ name: "chicc" });
    res.send(find);
});

// Closes the db
app.get('/close', (req, res) => {
    db.close();
});

// Generate RS256 private keys with this commmand:
// ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
// Dont add passphrase 
// Wont work unless you installed jwt correctly

let tokenforparsing;
app.get('/jwtsign', (req, res) => {
    // const RS256key = fs.readFileSync('jwtRS256.key');
    // const a = jwt.sign({ name: "chicc" }, RS256key, { algorithm: 'RS256' }, (err, token) => {
        // console.log(token);
        // tokenforparsing = token;
        // res.send(token);
    // });
    var a = jwt.sign({ name: "chicc" }, 'shhhhh');
    res.send(a);
});

// Verifys it make sure to visit /jwtsign to generate the token otherwise it will return an error

app.get('/jwtverify', (req, res) => {
    jwt.verify(tokenforparsing, fs.readFileSync('jwtRS256.key'), { algorithms: ['RS256'] },(err, decoded) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log(decoded.name);
            console.log(decoded);
            res.send(decoded.name);
        }
    });
});

// Decodes the token, make sure to visit /jwtsign to generate the token otherwise an error will happen
app.get('/jwtdecode', (req, res) => {
    const decodedToken = jwt.decode(tokenforparsing, { complete: true });
    console.log(decodedToken);
    res.send(decodedToken);
});

// Makes a cookie with name: name, value: chicc
// Set to secure and httpOnly

app.get('/gencookie', (req, res) => {
    res.cookie('name', 'chicc', {
        secure: true,
        httpOnly: true
    });
    res.send("hello");
});

// Gets all cookies 

app.get('/getcookie', (req, res) => {
    res.send(req.cookies);
});

// Make sure we are connected to the db if so then run the api
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connection has been acheived, Running API');
    app.listen(5000);
});
