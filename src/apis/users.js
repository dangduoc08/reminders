const { Router } = require('express')

class Users {
  static instance

  constructor(usersController) {
    this.usersController = usersController
    this.router = Router()
  }

  static getInstance(usersController) {
    if (!Users.instance) {
      Users.instance = new Users(usersController)
    }

    return Users.instance
  }

  serve() {
    this.router.post('/signup', async (req, res) => {
      try {
        const { first_name,
          last_name,
          email,
          status,
          created_at,
          updated_at
        } = await this.usersController.signup(req.body.data)

        return res
          .status(201)
          .json({
            message: 'success',
            data: {
              first_name,
              last_name,
              email,
              status,
              created_at,
              updated_at
            }
          })
      } catch (e) {
        res
          .status(e.code || 500)
          .json({
            message: e.message,
            data: null
          })
      }
    })

    this.router.post('/signin', async (req, res) => {
      try {
        const user = await this.usersController.signin(req.body.data)

        return res
          .status(200)
          .json({
            message: 'success',
            data: user
          })
      } catch (e) {
        return res
          .status(e.code || 500)
          .json({
            message: e.message,
            data: null
          })
      }
    })

    return this.router
  }
}

module.exports = Users