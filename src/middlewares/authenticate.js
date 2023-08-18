const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
  if (!req.cookies || !req.cookies?.token) {
    return res
      .status(401)
      .json({
        message: 'authentication failed. Please login to proceed',
        data: null,
      })
  }

  const { token } = req.cookies

  jwt.verify(token.replace('Bearer', '').trim(), process.env.PRIVATE_KEY, (e, user) => {
    if (e !== null) {
      return res
        .status(401)
        .json({
          message: e.message,
          data: null,
        })

    }

    req.user = user
    next()
  })

}

module.exports = authenticate