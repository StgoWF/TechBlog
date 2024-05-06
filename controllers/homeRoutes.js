const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const bcrypt = require('bcrypt');

// Route for the home page that displays all posts
router.get('/', async (req, res) => {
    try {
        const postData = await Post.findAll();
        const posts = postData.map(post => post.get({ plain: true }));
        res.render('home', { posts }); // Assuming you have a template engine set up for rendering
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading page');
    }
});

router.get('/dashboard', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
    } else {
        try {
            const userPosts = await Post.findAll({
                where: {
                    userId: req.session.user_id
                }
            });
            res.render('dashboard', { posts: userPosts, logged_in: req.session.logged_in });
        } catch (error) {
            console.error('Error accessing the dashboard:', error);
            res.status(500).send('Error accessing the dashboard');
        }
    }
});

// Route to display the signup page
router.get('/signup', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/dashboard');
        return;
    }
    res.render('signup');
});
// POST route for user registration
router.post('/signup', async (req, res) => {
    try {
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });

        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;

            // Redirige al usuario a la página principal con un parámetro de consulta
            res.redirect('/?signup=success');
        });
    } catch (err) {
        // Enviar al usuario de vuelta al formulario de signup con un mensaje de error
        res.status(400).render('signup', { error: err.message });
    }
});



// Route to display the login page
router.get('/login', (req, res) => {
    res.render('login'); // Make sure 'login' matches the name of your Handlebars file without the extension
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        const userData = await User.findOne({ where: { username: req.body.username } });
        if (!userData) {
            res.status(400).render('login', { error: 'Incorrect username or password.' });
            return;
        }

        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            res.status(400).render('login', { error: 'Incorrect username or password.' });
            return;
        }

        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;

            // Redirect the user to the main page with a query parameter
            res.redirect('/?login=success');
        });
    } catch (err) {
        res.status(500).render('login', { error: err.message });
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


router.get('/posts/new', (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    res.render('new-post');  
});

// POST route to create a new post
router.post('/posts', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        const newPost = await Post.create({
            ...req.body,
            userId: req.session.user_id  // Ensure associating the post with the user
        });
        res.redirect('/dashboard');  // Redirect to the dashboard after creating the post
    } catch (error) {
        res.status(500).json(error);
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
