const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();

//Connect to database
mongoose
	.connect('mongodb://localhost:27017/auth-demo', {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false
	})
	.then(() => console.log('MongoDB Connection Succeeded.'))
	.catch(err => console.log('Error in DB connection: ' + err));

//Passport Config
require('./config/passport')(passport);

//BodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Request Logging
app.use(logger('dev'));

//Express Session
app.use(
	session({
		secret: 'any thing here',
		resave: true,
		saveUninitialized: true
	})
);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash
app.use(flash());

//Global Variables
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

//ROUTES
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
