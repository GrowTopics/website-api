// MongoDB stuff
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
mongoose.connect('mongodb://dbgt:CSZtni4ESQkVkI9hlSow0TQgQ7HoEJyNnV3Pn6Er2HXEnCuZsdzAoDKrsiyC9Pndy3C328looSstaVWkDpfpgQ==@dbgt.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@dbgt@', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
autoIncrement.initialize(db);

// other random imports
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// MongoDB schemas
const userSchema = require('./schemas/userSchema');
const orderSchema = require('./schemas/orderSchema');
const blogSchema = require('./schemas/blogSchema');
const jwtSchema = require('./schemas/jwtSchema');

// Express and everything related to express
const cookieparser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));

// Test app.post with - curl -d "example=example" -X url

// Get a list of all topics
app.get('/api/blog/topics', async(req, res) => {
    try {
        const topics = await blogSchema.find({});
        res.send(topics);
    } catch (e) { console.log(e); return res.status(500).send("500 Internal Server Error"); }
});

// Add a new topic for blog writers
app.post('/api/blog/topic', async(req, res) => {
    try {
        const data = new blogSchema({ status: 0, topic: req.body.topic});
        data.save();
        res.send("200 OK");
    } catch (e) { console.log(e); return res.status(500).send("500 Interal Server Error"); }
});

// Deletes a topic
app.delete('/api/blog/topic', async(req, res) => {
    try {
        await blogSchema.deleteOne({id: req.query.id});
        res.send("200 OK")
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Updates a blog with text
app.post('/api/blog/save', async(req, res) => {
    try {
        body = req.body
        await blogSchema.updateOne({ id: body.id }, { text: body.text });
        res.send("200 OK");
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Gets a users rank
app.get('/api/admin/rank', async(req, res) => {
   try {
       const query = req.query;
       const data = await userSchema.findOne({ username: query.username });
       res.send(data);
   } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Updates a users rank
app.post('/api/admin/rank', async(req, res) => {
    try {
        const body = req.body;
        await userSchema.updateOne({ username: body.username }, { rank: body.rank });
        res.send("200 OK");
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Gets a users prefix
app.get('/api/user/prefix', async(req, res) => {
    try {
        const query = req.query;
        const data = await userSchema.findOne({ username: query.username });
        res.send(data);
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Updates a users prefix
app.post('/api/user/prefix', async(req, res) => {
    try {
        const body = req.body;
        await userSchema.updateOne({ username: body.username }, { prefix: body.prefix });
        res.send("200 OK");
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Submits a blog with text
app.post('/api/blog/submit', async(req, res) => {
   try {
       const body = req.body;
       await blogSchema.updateOne({ id: body.id }, { text: body.text, status: 3 });
       res.send("200 OK");
   } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Checks users creds then if it is valid signs a jwt and returns it
app.get('/api/user/login', async(req, res) => {
   try {
       const query = req.query;
       const data = await userSchema.findOne({ username: query.username });
       bcrypt.compare(query.password, data, async(err, result) => {
           if (err) { console.log(err); res.status(500).send("500 Internal Server Error"); return; }
           if (result === true) {
               const privateKey = fs.readFileSync('jwtRS256.key');
               const token = jwt.sign({ username: query.username }, privateKey, { algorithm: 'RS256' });

               const jwtTokens = await jwtSchema.findOne({ username: query.username });
               if (jwtTokens === null) {
                   const jwtData = new jwtSchema({ username: query.username, jwttokens: [token] });
                   jwtData.save();
               } else {
                   const tokens = token.jwttokens;
                   tokens[tokens.length] = token;
               }

               res.send(token);
           } else {
               res.status(403).send("403 Forbidden");
           }
       });
   } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Invalidates the jwt
app.get('/api/user/logout', async(req, res) => {
   try {
       const query = req.query;
       const decodedToken = jwt.decode(query.token);
       const data = await jwtSchema.findOne({ username: decodedToken.username });
       const storageData = (data.jwttokens).filter((item) => { return item !== query.token });
       await jwtSchema.updateOne({ username: decodedToken.username }, { jwttokens: storageData });

   } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Gets all user info
app.get('/api/user/info', async(req, res) => {
    try {
        const query = req.query
        const data = await userSchema.findOne({ username: query.username });
        if (data === null) {
            res.status(404).send("404 Not Found");
        }
        const returnData = { username: data.username, email: data.email, rank: data.rank, permissions: data.permissions, prefix: data.prefix };
        res.send(returnData);
    } catch (e) { console.log(e); res.status(500).send("500 Internal Server Error"); }
});

// Make sure we are connected to the db and if so run the API
var port = 5000;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connection has been achieved, Running API');
    app.listen(port);
});
