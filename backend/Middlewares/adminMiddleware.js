const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication failed: No token provided', 
        success: false 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied: Admin privileges  required', 
        success: false 
      });
    }

    // Set admin user in request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(401).json({ 
      message: 'Authentication failed: Invalid token', 
      success: false 
    });
  }
};

module.exports = verifyAdmin; 