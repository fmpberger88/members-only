const Messages = require('../models/messages');
const { body, validationResult } = require('express-validator');

// Middleware zur Nachrichtenvalidierung
exports.validateMessage = [
    body('text', 'Text must not be empty.')
        .trim()
        .isLength({ min: 1, max: 500 })
        .escape(),
];

// Nachrichten abrufen
exports.getMessages = async (req, res, next) => {
    try {
        const messages = await Messages.find({})
            .populate('user')
            .exec();
        res.render('index', { title: 'Message Board', messages: messages, user: req.user, csrfToken: req.csrfToken() });
    } catch (err) {
        next(err);
    }
};

// Neue Nachricht erstellen
exports.createMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const messages = await Messages.find({})
            .populate('user')
            .exec();
        return res.render('index', {
            title: 'Message Board',
            messages: messages,
            errors: errors.array(),
            csrfToken: req.csrfToken(),
        });
    }

    const message = new Messages({
        text: req.body.text,
        user: req.user._id,
    });

    try {
        await message.save();
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

// Nachricht löschen
exports.deleteMessage = async (req, res, next) => {
    try {
        await Messages.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};
