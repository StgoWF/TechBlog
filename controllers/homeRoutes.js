// controllers/homeRoutes.js
const express = require('express');
const router = express.Router();
const { User, Post, Comment } = require('../models');
const bcrypt = require('bcrypt');

// Route to display all posts on the home page
router.get('/', async (req, res) => {
    try {
        // Retrieve all posts along with their authors
        const postData = await Post.findAll({
            include: [
                {
                    model: User,
                    as: 'author' // Ensure correct alias based on model definitions
                }
            ]
        });
        
        // Map the retrieved data to plain objects
        const posts = postData.map(post => post.get({ plain: true }));
        
        // Render the home template with the posts data and logged_in status
        res.render('home', {
            posts,
            logged_in: req.session.logged_in
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error loading page');
    }
});

// GET route for the dashboard
router.get('/dashboard', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Retrieve posts created by the current user
        const userPosts = await Post.findAll({
            where: { userId: req.session.user_id }
        });

        // Map the retrieved data to plain objects
        const posts = userPosts.map((post) => post.get({ plain: true }));
        res.render('dashboard', { posts, logged_in: req.session.logged_in });
    } catch (err) {
        res.status(500).json(err);
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
        // Create a new user with the provided username and password
        const newUser = await User.create({
            username: req.body.username,
            password: req.body.password
        });

        // Save user session and redirect to login page with success message
        req.session.save(() => {
            req.session.user_id = newUser.id;
            req.session.logged_in = true;
            res.redirect('/login?signup=success');
        });
    } catch (err) {
        // Redirect back to signup page with error message if registration fails
        res.redirect(`/signup?signupError=${encodeURIComponent(err.message)}`);
    }
});

// Route to display the login page
router.get('/login', (req, res) => {
    res.render('login'); // Ensure 'login' matches the name of your Handlebars file without the extension
});

// POST route for user login
router.post('/login', async (req, res) => {
    try {
        // Find user with provided username
        const userData = await User.findOne({ where: { username: req.body.username } });
        if (!userData) {
            // Redirect with error message if user is not found
            res.redirect('/login?loginError=Incorrect username or password.');
            return;
        }

        // Check if provided password matches stored password
        const validPassword = await userData.checkPassword(req.body.password);
        if (!validPassword) {
            // Redirect with error message if password is incorrect
            res.redirect('/login?loginError=Incorrect username or password.');
            return;
        }

        // Save user session and redirect to main page with success message
        req.session.save(() => {
            req.session.user_id = userData.id;
            req.session.logged_in = true;
            res.redirect('/dashboard?login=success');
        });
    } catch (err) {
        res.status(500).redirect(`/login?loginError=${encodeURIComponent(err.message)}`);
    }
});

// GET route for user logout
router.get('/logout', (req, res) => {
    if (req.session.logged_in) {
        // Destroy user session and redirect to login page
        req.session.destroy(() => {
            res.redirect('/login');
        });
    } else {
        res.status(400).send('No session found');
    }
});

// POST route to log out
router.post('/logout', (req, res) => {
    if (req.session.logged_in) {
        // Destroy user session and send success response
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).json({ message: 'No user session found' });
    }
});

// Route to render the new post form
router.get('/posts/new', (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }
    res.render('new-post');  
});

// GET route to view a specific post and its comments
router.get('/posts/:id', async (req, res) => {
    try {
        const postData = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: Comment,
                    include: [{ model: User, as: 'user' }],
                    order: [['createdAt', 'DESC']]  // Order comments by creation date
                },
                {
                    model: User,
                    as: 'author'
                }
            ]
        });

        if (!postData) {
            console.log('No post found!');
            return res.status(404).render('post-not-found');
        }

        const post = postData.get({ plain: true });

        // Mark each comment with 'isOwner' if the current session user is the owner of the comment
        post.Comments = post.Comments.map(comment => {
            comment.isOwner = req.session.user_id === comment.userId;
            return comment;
        });

        res.render('post-detail', {
            post,
            logged_in: req.session.logged_in
        });
    } catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).render('error', { error: 'Failed to fetch post details.' });
    }
});


// GET route to render the edit post page
router.get('/posts/edit/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Find post by ID
        const postData = await Post.findByPk(req.params.id);

        if (!postData) {
            res.status(404).send('Post not found');
            return;
        }

        // Render edit post page with post data
        res.render('edit-post', { post: postData.get({ plain: true }) });
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST route to create a new post
router.post('/posts', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Create new post associated with current user
        const newPost = await Post.create({
            ...req.body,
            userId: req.session.user_id  // Ensure associating the post with the user
        });
        res.redirect('/dashboard');  // Redirect to dashboard after creating post
    } catch (error) {
        res.status(500).json(error);
    }
});

// POST route to update a post
router.post('/posts/update/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Update post with provided title and content
        const updatedPost = await Post.update({
            title: req.body.title,
            content: req.body.content
        }, {
            where: {
                id: req.params.id,
                userId: req.session.user_id // Ensure only the owner of the post can update it
            }
        });

        // Redirect to dashboard if post is successfully updated
        if (updatedPost) {
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Post not found or user not authorized to edit');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST route to delete a post
router.post('/posts/delete/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Delete post by ID and ensure only the owner of the post can delete it
        const result = await Post.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user_id 
            }
        });

        // Redirect to dashboard if post is successfully deleted
        if (result > 0) {
            res.redirect('/dashboard');
        } else {
            res.status(404).send('Post not found or user not authorized to delete');
        }
    } catch (error) {
        console.error('Failed to delete post:', error);
        res.status(500).json({ error: 'Error deleting post' });
    }
});

// POST route to add a comment to a post
router.post('/posts/comment/:id', async (req, res) => {
    console.log("Attempting to add comment:", req.body);
    console.log("Post ID:", req.params.id);
    console.log("User ID:", req.session.user_id);
    if (!req.session.logged_in) {
        // Redirect to login page if user is not logged in
        res.redirect('/login');
        return;
    }

    try {
        // Create new comment associated with specified post and user
        const newComment = await Comment.create({
            content: req.body.content,
            postId: req.params.id,
            userId: req.session.user_id  
        });

        // Redirect back to post details page to view added comment
        res.redirect(`/posts/${req.params.id}`);
    } catch (error) {
        // Handle errors that occur during the execution
        console.error('Error adding comment:', error); 
        res.status(500).render('error', { error: 'Failed to add comment' });
    }
});

// GET route to edit a comment
router.get('/comments/edit/:id', async (req, res) => {
    console.log("Fetching comment with ID:", req.params.id);

    try {
        // Find comment by ID and include associated post details
        const commentData = await Comment.findByPk(req.params.id, {
            include: [{ model: Post, as: 'post' }]
        });

        if (!commentData) {
            console.error('No comment found!');
            return res.status(404).render('error', { error: 'Comment not found' });
        }

        // Render edit comment page with comment and post data
        const comment = commentData.get({ plain: true });
        res.render('edit-comment', { comment, post: comment.post });
    } catch (error) {
        console.error('Error fetching comment details:', error);
        res.status(500).render('error', { error: 'Failed to fetch comment details' });
    }
});

// POST route to update a comment
router.post('/comments/update/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Update comment content and ensure only the author of the comment can update it
        const result = await Comment.update(
            { content: req.body.content },
            {
                where: {
                    id: req.params.id,
                    userId: req.session.user_id 
                }
            }
        );

        // Redirect to post details page after updating comment
        if (result == 0) {
            res.status(404).send('Comment not found or user not authorized to edit');
            return;
        }
        res.redirect(`/posts/${req.body.postId}`);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST route to delete a comment
router.post('/comments/delete/:id', async (req, res) => {
    if (!req.session.logged_in) {
        res.redirect('/login');
        return;
    }

    try {
        // Delete comment by ID and ensure only the author of the comment can delete it
        const result = await Comment.destroy({
            where: {
                id: req.params.id,
                userId: req.session.user_id 
            }
        });

        // Redirect to post details page after deleting comment
        if (result == 0) {
            res.status(404).send('Comment not found or user not authorized to delete');
            return;
        }
        res.redirect(`/posts/${req.body.postId}`);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
