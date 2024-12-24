import { Router } from 'express'

export default class Lists {
  static _instance

  constructor(listsController, listsValidation, listsTransformation) {
    this.listsController = listsController
    this.listsValidation = listsValidation
    this.listsTransformation = listsTransformation
    this.router = Router()
  }

  static getInstance(listsController, listsValidation, listsTransformation) {
    if (!Lists._instance) {
      Lists._instance = new Lists(listsController, listsValidation, listsTransformation)
    }
    return Lists._instance
  }

  serve() {
    this.router.post('/', async (req, res) => {
      try {
        const dto = this.listsTransformation.transformCreate({
          title: req.body?.data?.title,
          title_color: req.body?.data?.title_color,
          user_id: req.user.id,
        })

        this.listsValidation.validateCreate(dto)

        const list = await this.listsController.create(dto)

        return res
          .status(201)
          .json({
            message: 'Success',
            errors: null,
            data: list
          })
      } catch ({ message, errors, code = 500 }) {
        res
          .status(code)
          .json({
            message,
            errors,
            data: null
          })
      }
    })

    this.router.get('/', async (req, res) => {
      try {
        const dto = this.listsTransformation.transformList({
          limit: req.query?.limit,
          offset: req.query?.offset,
          sort: req.query?.sort,
          order: req.query?.order,
          user_id: req.user.id,
        })

        this.listsValidation.validateList(dto)

        const lists = await this.listsController.list(dto)

        return res
          .status(201)
          .json({
            message: 'Success',
            errors: null,
            data: lists
          })
      } catch ({ message, errors, code = 500 }) {
        res
          .status(code)
          .json({
            message,
            errors,
            data: null
          })
      }
    })

    return this.router
  }
}
