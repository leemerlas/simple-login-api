import express from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import expressValidator from 'express-validator';
import config from 'config';
import User from "../models/User.js";

const { check, validationResult } = expressValidator;
const router = express.Router();

// @route   POST /auth
// @desc    Auth user and provide token
// @access  Public
router.post('/',
[
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        
        let user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ errors: [ { msg: 'User not found' } ] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

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
                res.json({ token, msg: 'User logged in successfully' });
            }
        );

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server Error')
    }

})

export default router;