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
      const user = await this.usersModel.getOneByUsernameOrEmail(username, email)

      if (!user) {
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

    if (
      !validator.isLength(username, { min: 10, max: 50 }) ||
      username.trim().match(/ /gi)?.length > 0
    ) {
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
    // const ok = await this.canUserCreate(username, email)
    // if (!ok) {
    //   throw new HTTPError('username or email have created', 409)
    // }

    // FIXME: - Information Disclosure
    const emailOk = await this.usersModel.getOneByEmail(email)
    if (emailOk) {
      throw new HTTPError('email have used', 409)
    }

    const usernameOk = await this.usersModel.getOneByUsername({ username })
    if (usernameOk) {
      throw new HTTPError('username have used', 409)
    }

    const hash = bcrypt.hashSync(password, 10)
    const user = await this.usersModel.createOne({ ...input, hash })

    return user
  }

  // core feature
  async signin(input) {
    const {
      username,
      password
    } = input

    // FIXME: - Data not trim space
    // - email
    // - first_name
    // - last_name
    this.validateSignin(input)

    const user = await this.usersModel.getOneByUsername({ username })
    if (!user) {
      throw new HTTPError('user not exists')
    }

    // FIXME: - When signin not check status === Actived

    const isMatchedPwd = bcrypt.compareSync(password, user.hash)
    if (!isMatchedPwd) {
      throw new HTTPError('authentication failed', 401)
    }

    // FIXME: - JWT has no exp time
    const token = jwt.sign(user, process.env.PRIVATE_KEY)
    user.token = token

    return user
  }
}

module.exports = Users