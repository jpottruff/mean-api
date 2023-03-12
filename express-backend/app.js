const express = require('express');

const app = express();

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