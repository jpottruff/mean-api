const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const router = express.Router();

const User = require('../models/user');
const user = require('../models/user');

router.post('/signup', (req, res, next) => {
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
});

router.post("/login", (req, res, next) => {
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
                'super_secret_hash_validator_that_should_be_longer_but_this_is_a_demo',
                {expiresIn: '1h'}
            );
            
            console.log('Auth succeeded')
            res.status(200).json({
                message: 'Auth succeeded',
                token,
                expiresIn: 3600 // 1h in sec
            })
        })
        .catch(err => {
            console.log('Auth failed. Error logging in user', err);
            return res.status(401).json({
                message: 'Auth failed.',
                error: err
            });
        });
});

module.exports = router;