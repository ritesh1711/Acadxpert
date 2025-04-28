const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const verifyDocumentAccess = (req, res, next) => {
  try {
    console.log("Document access request for:", req.path);
    
    // Sanitize the path to prevent directory traversal attacks
    const requestPath = req.path.replace(/^\/+/, '');
    if (!requestPath || requestPath.includes('..') || requestPath.includes('/')) {
      console.error("Invalid path requested:", req.path);
      return res.status(400).send('Invalid file path');
    }
    
    // Check if token is provided via query parameter
    let token = req.query.token;
    
    // If not in query, check Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If still no token, deny access
    if (!token) {
      console.error("No token provided for file access:", requestPath);
      return res.status(401).send('Unauthorized: No token provided');
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Invalid token for file access:", err.message);
        return res.status(401).send('Unauthorized: Invalid token');
      }
      
      // Set user in request for further use if needed
      req.user = decoded;
      
      // Get the file path from URL
      const filePath = path.join(__dirname, '..', 'uploads', requestPath);
      console.log("Looking for file at:", filePath);
      
      // Check if file exists
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("File not found:", filePath, err.message);
          return res.status(404).send('File not found');
        }
        
        // File exists and user is authorized, proceed
        next();
      });
    });
  } catch (error) {
    console.error('Document access error:', error);
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = verifyDocumentAccess; 