const express = require('express');

const authCheck = require('../middleware/auth-check');
const fileHandler = require('../middleware/file-handler');
const PostsController = require('../controllers/posts');

const router = express.Router();

router.post('', authCheck, fileHandler.extractFile, PostsController.createPost);

// * PUT = completely replace a resource | PATCH = only update a resource with new values;
router.put('/:id', authCheck, fileHandler.extractFile, PostsController.updatePost);

router.get('', PostsController.getPosts);

router.get('/:id', PostsController.getPost);

router.delete('/:id', authCheck, PostsController.deletePost);

module.exports = router;