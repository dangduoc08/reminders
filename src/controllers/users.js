const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const HTTPError = require('../error')

class Users {
  static _instance

  constructor(usersModel, mailsController) {
    this.usersModel = usersModel
    this.mailsController = mailsController
  }

  static getInstance(usersModel, mailsController) {
    if (!Users._instance) {
      Users._instance = new Users(usersModel, mailsController)
    }

    return Users._instance
  }

  async canUserCreate(username, email) {
    try {
      const users = await this.usersModel.listByUsernameOrEmail(username, email)

      if (users.length === 0) {
        return true
      }

      return false
    } catch (_) {
      return false
    }
  }

  validateSignup(input) {
    const {
      first_name,
      last_name,
      email,
      username,
      password,
      dob
    } = input

    if (
      !validator.isLength(first_name, { min: 1, max: 50 }) ||
      !validator.isAlpha(first_name)
    ) {
      throw new HTTPError('invalid first_name', 422)
    }

    if (
      !validator.isLength(last_name, { min: 2, max: 50 }) ||
      !validator.isAlpha(last_name)
    ) {
      throw new HTTPError('invalid last_name', 422)
    }

    if (!validator.isEmail(email)) {
      throw new HTTPError('invalid email', 422)
    }

    if (!validator.isLength(username, { min: 10, max: 50 })) {
      throw new HTTPError('invalid username', 422)
    }

    if (!validator.isStrongPassword(password)) {
      throw new HTTPError('invalid password', 422)
    }

    if (!validator.isDate(new Date(dob))) {
      throw new HTTPError('invalid dob', 422)
    }
  }

  validateSignin(input) {
    const {
      username,
      password
    } = input

    if (!validator.isLength(username, { min: 10, max: 50 })) {
      throw new HTTPError('unmatched username', 401)
    }

    if (!validator.isStrongPassword(password)) {
      throw new HTTPError('unmatched password', 401)
    }
  }

  /**
   * 
   * @param {*} input 
   * @returns user record
   */
  async signup(input) {
    const {
      email,
      username,
      password
    } = input
    // await this.mailsController.send('Verify account', email, 'click to link')

    /**
     * @description validation input data from client request
     */
    await this.validateSignup(input)

    /**
    * @description check whether username or email duplicated
    */
    const ok = await this.canUserCreate(username, email)
    if (!ok) {
      throw new HTTPError('username or email have created', 409)
    }

    const hash = bcrypt.hashSync(password, 10)
    const user = await this.usersModel.create({ ...input, hash })

    return user
  }

  // core feature
  async signin(input) {
    const {
      username,
      password
    } = input

    this.validateSignin(input)

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

    const token = jwt.sign(user, process.env.PRIVATE_KEY)
    user.token = token

    return user
  }
}

module.exports = Users