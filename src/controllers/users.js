const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const HTTPError = require('../error')

class Users {
  static instance

  constructor(usersModel, mailsController) {
    this.usersModel = usersModel
    this.mailsController = mailsController
  }

  static getInstance(usersModel, mailsController) {
    if (!Users.instance) {
      Users.instance = new Users(usersModel, mailsController)
    }

    return Users.instance
  }

  async isUserExists(username, email) {
    try {
      const users = await this.usersModel.listByUsernameOrEmail(username, email)

      if (users.length > 0) {
        return true
      }

      return false
    } catch (_) {
      return true
    }
  }

  validateSignup(userInfo) {
    const {
      first_name,
      last_name,
      email,
      username,
      password,
      dob
    } = userInfo

    if (
      !validator.isLength(first_name, { min: 1, max: 50 }) && 
      !validator.isAlpha(first_name)
    ) {
      throw new HTTPError('invalid first_name', 422)
    }

    if (
      !validator.isLength(last_name, { min: 2, max: 50 }) &&
      !validator.isAlpha(last_name)
    ) {
      throw new HTTPError('invalid last_name', 422)
    }

    if (!validator.isEmail(email)) {
      throw new HTTPError('invalid email', 422)
    }

    if (!validator.isLength(username, { min: 4, max: 50 })) {
      throw new HTTPError('invalid username', 422)
    }

    if (!validator.isStrongPassword(password)) {
      throw new HTTPError('invalid password', 422)
    }

    if (!validator.isDate(dob)) {
      throw new HTTPError('invalid dob', 422)
    }
  }

  validateSignin(userInfo) {
    const {
      username,
      password
    } = userInfo

    if (!validator.isLength(username, { min: 4, max: 50 })) {
      throw new HTTPError('unmatched username', 401)
    }

    if (!validator.isStrongPassword(password)) {
      throw new HTTPError('unmatched password', 401)
    }
  }

  // core feature
  async signup(userInfo) {
    const {
      email,
      username,
      password
    } = userInfo
    // await this.mailsController.send('Verify account', email, 'click to link')

    await this.validateSignup(userInfo)

    const hash = bcrypt.hashSync(password, 10)

    const isUserExists = await this.isUserExists(username, email)
    if (isUserExists) {
      throw new HTTPError('username or email have created', 409)
    }

    const user = await this.usersModel.create({ ...userInfo, hash })

    return user
  }

  // core feature
  async signin(signinInfo) {
    const {
      username,
      password
    } = signinInfo

    this.validateSignin(userInfo)

    const userRec = await this.usersModel.getByUsername({ username })
    if (!userRec) {
      throw new HTTPError('user not exists')
    }

    const isMatchedPwd = bcrypt.compareSync(password, userRec.hash)
    if (isMatchedPwd) {
      throw new HTTPError('authentication failed', 401)
    }
    delete userRec.hash
    const { first_name, last_name, email, dob, id } = userRec

    const user = {
      id,
      first_name: first_name,
      last_name: last_name,
      email,
      dob,
    }

    const token = jwt.sign(user, process.env.PRIVATE_KEY);
    user.token = token

    return user
  }
}

module.exports = Users