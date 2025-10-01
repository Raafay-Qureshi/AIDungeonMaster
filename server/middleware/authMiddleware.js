const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if the request headers contain a token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user by the ID from the token and attach it to the request object
      // We exclude the password from being attached
      req.user = await User.findById(decoded.id).select('-passwordHash');

      // 4. Move on to the next step (the controller)
      next();
    } catch (error) {
      console.error(error);
      
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired',
          expired: true,
          expiredAt: error.expiredAt
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token',
          invalid: true
        });
      } else {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };