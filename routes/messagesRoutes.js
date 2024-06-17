const express = require('express')
const messagesRouter = express.Router()
const Messages = require('../models/messages');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false })


messagesRouter.get('/', csrfProtection, async (req, res, next) => {
    try {
        const messages = await Messages.find({})
            .populate('user')
            .exec();

        res.render('index', { title: 'Message Board', messages: messages, user: req.user, csrfToken: req.csrfToken() });
    } catch (err) {
        next(err);
    }
});

messagesRouter.post('/new', ensureAuthenticated, csrfProtection, [
    body('text', "Text must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // Fetch messages again to render the page properly
            const messages = await Messages.find({})
                .populate('user')
                .exec();

            return res.render('index', {
                title: 'Message Board',
                messages: messages,
                errors: errors.array(),
                csrfToken: req.csrfToken()
            });
        }

        const message = new Messages({
            text: req.body.text,
            user: req.user._id // Link the current logged-in user's ID
        });

        try {
            const savedMessage = await message.save();
            res.redirect('/');
        } catch (err) {
            next(err);
        }
    }
]);

messagesRouter.post('/delete/:id', ensureAuthenticated, isAdmin, async (req, res, next) => {
    try {
       await Messages.findByIdAndDelete(req.params.id);
       res.redirect('/');
    } catch(err) {
        next(err);
    }
})

module.exports = messagesRouter;