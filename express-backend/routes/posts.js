const express = require('express');
const multer = require('multer');

const authCheck = require('../middleware/auth-check');

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
router.post(
    '', 
    authCheck,
    multer({storage: storageConfig}).single('image'), 
    (req, res, next) => {
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        const url = `${serverUrl}/images/${req.file.filename}`;
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            imagePath: url,
            creator: req.userData.userId
        });
        // * Mongoose: collection name = plural form of model name
        post.save()
            .then(result => {
                console.log('Post saved', result)
                res.status(201).json({
                    message: 'Post added successfully',
                    post: {
                        ...result,
                        id: result._id,
                    }
                });
            });
});

// * PUT = completely replace a resource | PATCH = only update a resource with new values;
router.put(
    '/:id', 
    authCheck,
    multer({storage: storageConfig}).single('image'), 
    (req, res, next) => {     
        // * Check for new file upload
        let imagePath = req.body.imagePath;
        if (req.file) {
            const serverUrl = `${req.protocol}://${req.get('host')}`;
            const url = `${serverUrl}/images/${req.file.filename}`;
            imagePath = url;
        }

        const post = new Post({
            _id: req.body.id,
            title: req.body.title,
            content: req.body.content,
            imagePath
        });

        Post.updateOne({ _id: req.params.id }, post)
            .then(result => {
                console.log('Post updated', result);
                res.status(200).json({ 
                    message: 'Post updated successfully',
                    post: {
                        id: req.body.id,
                        title: req.body.title,
                        content: req.body.content,
                        imagePath
                    }
                })
            });
});

router.get('', (req, res, next) => {
    // NOTE: query comes in as a string - `+` coverts to number
    const pageSize = +req.query.pageSize;
    const page = +req.query.page;
    const postQuery = Post.find();
    if (pageSize && page) {
        postQuery.skip(pageSize * (page - 1));
        postQuery.limit(pageSize)
    }

    let fetchedPosts;
    postQuery
        .then(documents => {
            console.log('Retrieved posts');
            fetchedPosts = documents;
            return Post.count();
        })
        .then(count => {
            console.log('Counted documents');

            res.status(200).json({
                message: 'Posts successfully fetched',
                posts: fetchedPosts,
                totalPosts: count
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

router.delete(
    '/:id', 
    authCheck,
    (req, res, next) => {
        Post.deleteOne({_id: req.params.id})
            .then(result => {
                console.log('Delete successful', result);
                res.status(200).json({message: 'Post deleted'});
            });
});

module.exports = router;