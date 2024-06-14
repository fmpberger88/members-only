const express = require('express');
const path = require('path');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('./middlewares/passport');
const errorHandler = require('./middlewares/errorHandler');
const ensureAuthenticated = require('./middlewares/ensureAuthenticated');
require('dotenv').config();

// ________________ Database ________________
require('./db/mongoDB');

// ________________ Environments Variables ________________
const PORT = process.env.PORT || 5000;

// ________________ Express App ________________
const app = express();

// ________________ View Engine ________________
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ________________ Middlewares ________________
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

// ________________ Express Session ________________
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 60 * 1000,
    }
}))

// ________________ Passport Configuration ________________
app.use(passport.session());


// ________________ Routes ________________
app.get('/', (req, res, next) => {
    console.log("Environment:", req.app.get('env'));
    res.send("Hello World!");
})

// Custom 401 Unauthorized Middleware
app.get('/protected', ensureAuthenticated, (req, res, next) => {
    res.send('You are logged in!');
});

// ________________ ErrorHandler ________________
// Custom 404 Middleware
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

// General Error Handling Middleware
app.use(errorHandler);

// // ________________ Server ________________
app.listen(PORT, ()=> {
    console.log(`Listing on port ${PORT}`)
})