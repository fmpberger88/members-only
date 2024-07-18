const express = require('express');
const messagesRouter = express.Router();
const messagesController = require('../controllers/messagesController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');
const isAdmin = require('../middlewares/isAdmin');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: false });

messagesRouter.get('/', csrfProtection, messagesController.getMessages);
messagesRouter.post('/new', ensureAuthenticated, csrfProtection, messagesController.validateMessage, messagesController.createMessage);
messagesRouter.post('/delete/:id', ensureAuthenticated, isAdmin, messagesController.deleteMessage);

module.exports = messagesRouter;
