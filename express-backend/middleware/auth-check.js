const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // splits 'Bearer myTokenString' => ['Bearer', 'myTokenString']
        const token = req.headers.authorization.split(' ')[1];
        // pass along with the request so info can be used (eg. in create post)
        const decodedToken = jwt.verify(token, 'super_secret_hash_validator_that_should_be_longer_but_this_is_a_demo');
        req.userData = { email: decodedToken.email, userId: decodedToken.userId }
        next();
    } catch (err) {
        console.log('Auth check failed.')
        res.status(401).json({ message: 'Auth failed', error: err })
    }
}