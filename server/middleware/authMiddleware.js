const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // Check for local user ID in header
    const localUserId = req.headers['x-local-user-id'];
    
    if (!localUserId) {
      return res.status(401).json({ message: 'Not authorized, no user ID' });
    }

    // Find or create user based on local ID
    let user = await User.findOne({ localUserId }).select('-passwordHash');
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        localUserId,
        username: `User_${localUserId.split('_')[1]}`,
        email: `${localUserId}@local.app`,
        passwordHash: 'local_auth_not_required'
      });
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, authentication failed' });
  }
};

module.exports = { protect };