const express = require('express');
const bodyParser = require('body-parser');
const Post = require('./models/post')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Mathods", "GET, POST, PATCH, DELETE, OPTIONS");
    
    next();
});

app.post('/api/posts', (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
    });
    console.log(post);
    res.status(201).json({
        message: 'Post added successfully'
    });
});

app.use('/api/posts', (req, res, next) => {
    const posts = [
        {id: 1, title: 'First Post', content: "This is some content for a post"},
        {id: 2, title: 'Second Post', content: "Its more content"},
        {id: 3, title: 'Third Post', content: "Content of a post"},
    ]
    
    res.status(200).json({
        message: 'Posts successfully fetched',
        posts
    })
});

module.exports = app;