const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try { // lecture 104
    // Ex: 'bearer jorohihjthjiaerigiog'
	// authorization should match with Authorization in angular code  in AuthInterceptor file. case is insensitive. After setting the Authorization headr in AuthInterceptor, we sholud set the header named 'Authorization' in app.js
    const token = req.headers.authorization.split(' ')[1]; //  a more explination about this line and 'bearer ' in lecture 104
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {email: decodedToken.email, userId: decodedToken.userId}; // lecture 116
    next();
  } catch(error) {
    res.status(401).json({
      message: 'You are not authenticated!'
    });
  }
}
