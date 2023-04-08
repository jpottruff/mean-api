const express = require('express');
const multer = require('multer');

const authCheck = require('../middleware/auth-check');
const PostsController = require('../controllers/posts');

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


// NOTE: `image` needs to line up with the property being passed from the front end
router.post(
    '', 
    authCheck,
    multer({storage: storageConfig}).single('image'),
    PostsController.createPost
);

// * PUT = completely replace a resource | PATCH = only update a resource with new values;
router.put(
    '/:id', 
    authCheck,
    multer({storage: storageConfig}).single('image'),
    PostsController.updatePost 
);

router.get('', PostsController.getPosts);

router.get('/:id', PostsController.getPost);

router.delete(
    '/:id', 
    authCheck,
    PostsController.deletePost
);

module.exports = router;