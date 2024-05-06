const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const bcrypt = require('bcrypt');

// POST route for user registration
router.post('/signup', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });

        // Save session and log in new user
        req.session.save(() => {
            req.session.userId = newUser.id;
            req.session.logged_in = true;
            res.status(201).json(newUser);
        });
    } catch (err) {
        console.error('Error creating new user:', err);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { username: req.body.username } });
        if (!userData) {
            res.status(400).json({ message: 'Incorrect username or password, please try again' });
            return;
        }

        const validPassword = await bcrypt.compare(req.body.password, userData.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Incorrect username or password, please try again' });
            return;
        }

        req.session.save(() => {
            req.session.userId = userData.id;
            req.session.logged_in = true;
            res.json({ user: userData, message: 'You are now logged in!' });
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ message: 'Failed to log in.' });
    }
});

// POST route to log out
router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).json({ message: 'No user session found' });
    }
});

// POST route to create a new post
router.post('/posts', async (req, res) => {
    try {
        const newPost = await Post.create({
            title: req.body.title,
            content: req.body.content,
            userId: req.session.userId  // This assumes the session stores the userId when logged in
        });
        res.status(201).json(newPost);
    } catch (err) {
        console.error('Error creating new post:', err);
        res.status(500).json({ message: 'Failed to create new post.' });
    }
});

// Update an existing post
router.put('/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.session.userId  // Make sure only the user who created the post can update it
            }
        });

        if (updatedPost) {
            res.json({ message: 'Post updated successfully', updatedPost });
        } else {
            res.status(404).json({ message: 'Post not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post' });
    }
});

// Delete a post
router.delete('/posts/:id', async (req, res) => {
    try {
        const result = await Post.destroy({
            where: {
                id: req.params.id,
                userId: req.session.userId  // Make sure only the user who created the post can delete it
            }
        });

        if (result) {
            res.json({ message: 'Post deleted successfully' });
        } else {
            res.status(404).json({ message: 'Post not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
});



// POST route to create a new comment on a post
router.post('/comments', async (req, res) => {
    console.log('POST request to /comments received', req.body);
    try {
        // Ensure the user is logged in
        if (!req.session.logged_in) {
            res.status(401).json({ message: 'Please log in to leave a comment.' });
            return;
        }

        const newComment = await Comment.create({
            content: req.body.content,
            userId: req.session.userId, // Assume the user's ID is stored in the session
            postId: req.body.postId // The ID of the post to which the comment is being added
        });
        
        res.status(201).json(newComment);
    } catch (err) {
        console.error('Error creating new comment:', err);
        res.status(500).json({ message: 'Failed to create new comment.' });
    }
});

// Update a comment
router.put('/comments/:id', async (req, res) => {
    try {
        const updatedComment = await Comment.update(req.body, {
            where: {
                id: req.params.id,
                userId: req.session.userId  // Only the creator of the comment can update it
            }
        });

        if (updatedComment) {
            res.json({ message: 'Comment updated successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
    try {
        const result = await Comment.destroy({
            where: {
                id: req.params.id,
                userId: req.session.userId  // Only the creator of the comment can delete it
            }
        });

        if (result) {
            res.json({ message: 'Comment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Comment not found or user not authorized' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Failed to delete comment' });
    }
});



module.exports = router;
