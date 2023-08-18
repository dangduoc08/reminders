const validator = require('validator')
const HTTPError = require('../error')

class Lists {
  static instance

  constructor(listsModel) {
    this.listsModel = listsModel
  }

  static getInstance(listsModel) {
    if (!Lists.instance) {
      Lists.instance = new Lists(listsModel)
    }

    return Lists.instance
  }

  async createOne({ title, title_color }, userID) {
    if (!validator.isLength(title, { min: 3, max: 100 })) {
      throw new HTTPError('invalid title', 422)
    }

    if (typeof title_color === 'string' && !validator.isHexColor(title_color)) {
      throw new HTTPError('invalid title_color', 422)
    }

    return await this.listsModel.createOneByUserID(title, title_color, userID)
  }

  async getMany(userID, limit = 50, offset = 0) {
    if (!validator.isInt(limit)) {
      throw new HTTPError('invalid limit', 422)
    }

    if (!validator.isInt(limit)) {
      throw new HTTPError('invalid offset', 422)
    }

    const lists = await this.listsModel.getManyByUserID(userID, limit, offset)

    return lists
  }
}

module.exports = Lists