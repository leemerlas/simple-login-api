import express from "express";
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import config from 'config';
import expressValidator from 'express-validator';
import User from '../models/User.js'

const { check, validationResult } = expressValidator;

const router = express.Router();

// @route   GET /users
// @desc    Get list of registered users, requires JWT
// @access  Private
router.get('/', auth, async(req, res) => {
    let users = await User.find()

    return res.json(users)
})

// @route   POST /users/register
// @desc    Register a user and returns a JWT
// @access  Public
router.post('/register', 
[
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please include a password at least 8 characters long').not().isEmpty().isLength({ min: 8 }),
    check('contactNumber', 'Contact number is required').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, contactNumber, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(500).json({ 
                errors: [ { msg: 'User email already exists' } ] 
            });
        }

        user = User({
            firstName,
            lastName,
            contactNumber,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        let encryptedPassword = await bcrypt.hash(password, salt);
        user.password = encryptedPassword;

        await user.save();

        const payload = {
            user: {
                id: user.id,
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: '1h'},
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'User registered successfully' });
            }
        );

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }

})

export default router;