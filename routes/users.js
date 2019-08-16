const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');

//REGISTER
router
	.route('/register')
	.get((req, res) => res.render('register'))
	.post((req, res) => {
		const { name, email, password, password2 } = req.body;
		let errors = [];

		//form inputs validation
		if (!name || !email || !password || !password2) {
			errors.push({ msg: 'Please fill in all fields' });
		}
		if (password !== password2) {
			errors.push({ msg: 'Passwords do not match' });
		}
		if (password.length < 8) {
			errors.push({ msg: 'Password must be at least 8 characters' });
		}

		if (errors.length > 0) {
			res.render('register', { errors, name, email, password, password2 });
		} else {
			//validation passed
			// here we will check if the user exists
			User.findOne({ email }).then(user => {
				if (user) {
					errors.push({ msg: 'Email is already registered' });
					res.render('register', { errors, name, email, password, password2 });
				} else {
					//we create new user
					const newUser = new User({ name, email, password });
					//hashing the password then save to database
					bcrypt.genSalt(10, (err, salt) => {
						bcrypt.hash(newUser.password, salt, (err, hash) => {
							if (err) throw err;
							//set password to hash and save
							newUser.password = hash;
							newUser
								.save()
								.then(user => {
									req.flash(
										'success_msg',
										'You are now registered and can log in'
									);
									res.redirect('/users/login');
								})
								.catch(console.log);
						});
					});
				}
			});
		}
	});

//Login
router
	.route('/login')
	.get((req, res) => res.render('login'))
	.post((req, res, next) => {
		passport.authenticate('local', {
			successRedirect: '/dashboard',
			failureRedirect: '/users/login',
			failureFlash: true
		})(req, res, next);
	});

//Log out
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;
