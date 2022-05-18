import jwt from 'jsonwebtoken';
import config from 'config';


// @desc    Handles JWT checking and authentication
// @access  Public
export default function(req, res, next) {
    // get token from header
    const token = req.header('x-auth-token');

    // check if no token
    if(!token) {
        return res.status(401).json({ msg: 'No token found, auth denied' });
    }

    // verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' })
    }
}