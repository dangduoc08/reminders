const { Router } = require('express')

class Lists {
  static instance

  constructor(listsController) {
    this.listsController = listsController
    this.router = Router()
  }

  static getInstance(listsController) {
    if (!Lists.instance) {
      Lists.instance = new Lists(listsController)
    }

    return Lists.instance
  }

  serve() {
    this.router.post('/', async (req, res) => {
      try {
        const list = await this.listsController.createOneList(req.body.data.title, req.user.id)

        res.status(201).json({
          message: 'success',
          data: list
        })
      } catch (e) {
        res.status(e.code || 500).json({
          message: e.message,
          data: null
        })
      }
    })

    this.router.get('/', async (req, res) => {
      try {
        const { limit, offset } = req.query
        const lists = await this.listsController.getLists(req.user.id, limit, offset)

        res.status(201).json({
          message: 'success',
          data: lists
        })
      } catch (e) {
        res.status(e.code || 500).json({
          message: e.message,
          data: null
        })
      }
    })

    return this.router
  }
}

module.exports = Lists