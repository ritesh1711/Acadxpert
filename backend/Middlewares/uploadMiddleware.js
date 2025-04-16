const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const verifyDocumentAccess = (req, res, next) => {
  try {
    // Check if token is provided via query parameter
    let token = req.query.token;
    
    // If not in query, check Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If still no token, deny access
    if (!token) {
      return res.status(401).send('Unauthorized: No token provided');
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send('Unauthorized: Invalid token');
      }
      
      // Set user in request for further use if needed
      req.user = decoded;
      
      // Debug the request path
      console.log("Request path:", req.path);
      
      // Get the file path from URL - use only req.path without 'uploads'
      // This is important because the URL will be something like /uploads/file.jpg
      // But the actual path is backend/uploads/file.jpg
      const filePath = path.join(__dirname, '..', 'uploads', req.path.replace(/^\/+/, ''));
      
      console.log("Looking for file at:", filePath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return res.status(404).send('File not found');
      }
      
      next();
    });
  } catch (error) {
    console.error('Document access error:', error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = verifyDocumentAccess; 