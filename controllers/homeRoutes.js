// controllers/homeRoutes.js
const express = require('express');
const router = express.Router();
const { User } = require('../models');

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        // Find user by username
        const userData = await User.findOne({ where: { username: req.body.username } });
        if (!userData) {
            // Send 400 error if user not found
            res.status(400).json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        // Verify password
        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            // Send 400 error if password is wrong
            res.status(400).json({ message: 'Incorrect email or password, please try again' });
            return;
        }

        // Save session and log in user
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            
            res.json({ user: userData, message: 'You are now logged in!' });
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

// POST route for user registration
router.post('/signup', async (req, res) => {
    try {
        // Create new user with provided username and password
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });

        // Save session and log in new user
        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;
            res.status(200).json(newUser);
        });
    } catch (err) {
        res.status(400).json(err);
    }
});

module.exports = router;
