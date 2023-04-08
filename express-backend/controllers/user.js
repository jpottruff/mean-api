const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(result => {
                    console.log('User saved')
                    res.status(201).json({ message: 'User created', result })
                })
                .catch(err => {
                    console.log('Error creating user: ', err)
                    res.status(500).json({message: 'Error creating user', error: err })
                })
        })  
}

exports.loginUser = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                console.log('Auth failed. User not found')
                return res.status(401).json({ message: 'Auth failed. User not found' })
            }
            
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password)
        })
        .then(compareResult => {
            if (!compareResult) {
                console.log('Auth failed. Wrong password')
                return res.status(401).json({message: 'Auth failed. Wrong password'});
            }   

            const token = jwt.sign(
                {email: fetchedUser.email, userId: fetchedUser._id}, 
                process.env.JWT_KEY,
                {expiresIn: '1h'}
            );
            
            console.log('Auth succeeded')
            res.status(200).json({
                message: 'Auth succeeded',
                token,
                expiresIn: 3600, // 1h in sec
                userId: fetchedUser._id
            })
        })
        .catch(err => {
            console.log('Auth failed. Error logging in user', err);
            return res.status(401).json({
                message: 'Invalid login credentials',
                error: err
            });
        });
};