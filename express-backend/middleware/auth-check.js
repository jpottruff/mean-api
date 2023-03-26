const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // splits 'Bearer myTokenString' => ['Bearer', 'myTokenString']
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, 'super_secret_hash_validator_that_should_be_longer_but_this_is_a_demo');
        next();
    } catch (err) {
        console.log('Auth check failed.')
        res.status(401).json({ message: 'Auth failed', error: err })
    }
}