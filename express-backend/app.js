const path = require('path')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

const DATABASE_NAME = 'mean-db';
const DATABASE_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_SERVER}:${process.env.MONGO_PORT}/${DATABASE_NAME}?${process.env.MONGO_OPTS}`;
mongoose.connect(DATABASE_URI)
    .then(() => console.log('DB connected...'))
    .catch(err => console.error(`DB connection failed! ${err}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Make images folder statically accessible
app.use('/images', express.static(path.join('express-backend/images')))


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    
    next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);


module.exports = app;