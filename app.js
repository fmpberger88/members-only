const express = require('express');
const path = require('path');
const { body, validationResult } = require('express-validator');
const logger = require('morgan');
const User = require('./models/users');
const helmet = require('helmet');
const bcrypt = require('bcrypt')
const session = require('express-session');
const passport = require('./middlewares/passport');
const errorHandler = require('./middlewares/errorHandler');
const ensureAuthenticated = require('./middlewares/ensureAuthenticated');
const { engine } = require('express-handlebars');
const messagesRouter = require('./routes/messagesRoutes');
require('dotenv').config();

// ________________ Database ________________
require('./db/mongoDB');

// ________________ Environment Variables ________________
const PORT = process.env.PORT || 5000;

// ________________ Express App ________________
const app = express();

// ________________ View Engine ________________
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        formatDate: function (date, format) {
            const dateFormat = {
                'fullDate': { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' },
                'shortDate': { year: 'numeric', month: 'short', day: 'numeric' }
            };
            return new Intl.DateTimeFormat('en-US', dateFormat[format] || dateFormat['shortDate']).format(date);
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));



app.set('view engine', 'hbs');


// ________________ Static Files ________________
app.use(express.static(path.join(__dirname, 'public')));

// ________________ Middlewares ________________
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// ________________ Express Session ________________
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_HENV === 'production',
        maxAge: 30 * 60 * 60 * 1000,
    }
}));

// ________________ Passport Configuration ________________
app.use(passport.session());

app.use((req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user; // Make user object available in all views
    }
    next();
});

// Middleware to log authentication status
app.use((req, res, next) => {
    console.log('Is Authenticated:', req.isAuthenticated());
    console.log('User:', req.user);
    next();
});




// ________________ Routes ________________

app.use('/', messagesRouter);

// Login Route
app.get('/log-in', (req, res) => {
    res.render('login');
})

app.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/"
    })
);

// Sign-Up Routes
app.get("/sign-up", (req, res) => {
    res.render('sign-up')
});

app.post('/sign-up', [
    body('email', 'Enter a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
    body('confirm_password', 'Passwords do not match').custom((value, { req }) => value === req.body.password)
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg; // keying errors by the param name
            return acc;
        }, {});
        console.log(formattedErrors);

        // Render the form with error messages and input data
        return res.status(400).render('sign-up', {
            title: 'Sign Up',
            errors: formattedErrors,
            data: req.body // Send back the input data so the user doesn't need to re-enter it
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            first_name: req.body.first_name,
            family_name: req.body.family_name
        });
        const result = await user.save();
        res.redirect('/');
    } catch (err) {
        return next(err);
    }
});



// Logout
app.get("/log-out", (req, res, nex) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/")
    });
});


// Custom 401 Unauthorized Middleware
app.get('/protected', ensureAuthenticated, (req, res, next) => {
    res.render('401', { title: 'Protected' }); // Example protected route
});

// ________________ ErrorHandler ________________
// Custom 404 Middleware
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

// General Error Handling Middleware
app.use(errorHandler);

// ________________ Server ________________
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
