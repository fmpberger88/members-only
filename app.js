const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const helmet = require('helmet');
require('dotenv').config();

// ________________ Database ________________
require('./db/mongoDB');

// ________________ Environments Variables ________________
const PORT = process.env.PORT || 5000;

// ________________ Express App ________________
const app = express();

// // ________________ View Engine ________________
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ________________ Middlewares ________________
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));

// ________________ Routes ________________
app.get('/', (req, res, next) => {
    res.send("Hello World!");
})

// // ________________ Server ________________
app.listen(PORT, ()=> {
    console.log(`Listing on port ${PORT}`)
})