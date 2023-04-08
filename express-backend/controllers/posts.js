const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
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
        .catch(err => {
            console.error(`Error getting docs: ${err}`)
            res.status(500).json({ message: 'Fetching posts failed', error: err });
        });
};

exports.getPost = (req, res, next) => {
    Post.findById(req.params.id)
        .then(document => {
            console.log(`Retrived post by id: ${req.params.id}`);
            document
                ? res.status(200).json({message: 'Post found', post: document})
                : res.status(404).json({message: 'Post not found'})
        })
        .catch(err => {
            console.log(`Could not get post ${req.params.id}`);
            res.status(500).json({ message: `Fetching post ${req.params.id} failed`, error: err });
        }) 
};

exports.createPost = (req, res, next) => {
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
        })
        .catch(err => {
            console.log('Error creating post')
            res.status(500).json({ message: 'Creating a post failed', error: err })
        })
};

exports.updatePost =     (req, res, next) => {     
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

    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
        .then(result => {
            console.log('Post updated', result);
            if (result.modifiedCount > 0) {
                res.status(200).json({ 
                    message: 'Post updated successfully',
                    post: {
                        id: req.body.id,
                        title: req.body.title,
                        content: req.body.content,
                        imagePath,
                        creator: req.userData.userId
                    }
                });
            } else {
                console.log('Not authorized to update post or post not found')
                res.status(401).json({ message: 'Not authorized to update post' })
            }
        })
        .catch(err => {
            console.log('Error updating post')
            res.status(500).json({ message: 'Could not update post', error: err})
        });
};

exports.deletePost = (req, res, next) => {
    Post.deleteOne({_id: req.params.id, creator: req.userData.userId })
        .then(result => {
            if (result.deletedCount > 0) {
                console.log('Delete successful', result);
                res.status(200).json({message: 'Post deleted'});
            } else {
                console.log('Not authorized to delete post or post not found')
                res.status(401).json({ message: 'Not authorized to delete post' })
            }
        })
        .catch(err => {
            console.log(`Error deleting post ${req.params.id}`)
            res.status(500).json({ message: `Deleting post ${req.params.id} failed`, error: err });
        });
};