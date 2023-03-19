const express = require('express');
const multer = require('multer');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
};
const storageConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        const error = isValid ? null : new Error('Invalid mime type')
        callback(error, 'express-backend/images');
    },
    filename: (req, file, callback) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        callback(null, `${name}-${Date.now()}.${ext}`);
    }  
});

const Post = require('../models/post');

// NOTE: `image` needs to line up with the property being passed from the front end
router.post('', multer({storage: storageConfig}).single('image'), (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
    });
    // * Mongoose: collection name = plural form of model name
    post.save()
        .then(result => {
            console.log('Post saved', result)
            res.status(201).json({
                message: 'Post added successfully',
                createdId: result._id
            });
        });
});

// * PUT = completely replace a resource | PATCH = only update a resource with new values;
// router.patch('/api/posts', (req, res, next) => {
router.put('/:id', (req, res, next) => { 
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content
    });
    Post.updateOne({ _id: req.params.id }, post)
        .then(result => {
            console.log('Updated post', result);
            res.status(200).json({ message: 'Post updated successfully'})
        });
});

router.get('', (req, res, next) => {
    Post.find()
        .then(documents => {
            console.log('Retrieved posts');
            res.status(200).json({
                message: 'Posts successfully fetched',
                posts: documents
            });
        })
        .catch(err => console.error(`Error getting docs: ${err}`))
});

router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id)
        .then(document => {
            console.log(`Retrived post by id: ${req.params.id}`);
            document
                ? res.status(200).json({message: 'Post found', post: document})
                : res.status(404).json({message: 'Post not found'})
        })
});

router.delete('/:id', (req, res, next) => {
    Post.deleteOne({_id: req.params.id})
        .then(result => {
            console.log('Delete successful', result);
            res.status(200).json({message: 'Post deleted'});
        });
});

module.exports = router;