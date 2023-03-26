const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const User = require('../models/user');

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

module.exports = router;