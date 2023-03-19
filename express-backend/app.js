const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');

const app = express();

const DB_LOCAL = {
    user: 'root',
    password: 'example',
    server: 'localhost',
    port: '27017',
    opts: 'serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=admin&authMechanism=SCRAM-SHA-256'
}
const DB_ENV = DB_LOCAL;
const DATABASE_NAME = 'mean-db';
const DATABASE_URI = `mongodb://${DB_ENV.user}:${DB_ENV.password}@${DB_ENV.server}:${DB_ENV.port}/${DATABASE_NAME}?${DB_ENV.opts}`;
mongoose.connect(DATABASE_URI)
    .then(() => console.log('DB connected...'))
    .catch(err => console.error(`DB connection failed! ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Make images folder statically accessible
app.use('/images', express.static(path.join('express-backend/images')))


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    
    next();
});

app.use('/api/posts', postsRoutes);


module.exports = app;