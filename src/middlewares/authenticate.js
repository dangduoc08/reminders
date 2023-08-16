const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  if (!req.cookies || !req.cookies?.token) {
    res.status(401).json({
      message: 'authentication failed. Please login to proceed',
      data: null,
    })
    return
  }

  const { token } = req.cookies

  jwt.verify(token.replace('Bearer', '').trim(), process.env.PRIVATE_KEY, (e, user) => {
    if (e !== null) {
      res.status(401).json({
        message: e.message,
        data: null,
      })
      return
    }
    
    req.user = user
    next()
  });

}

module.exports = authenticate