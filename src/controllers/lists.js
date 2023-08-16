const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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

  async createOneList(title, userID) {
    return await this.listsModel.createByUserID(title, userID)
  }

  async getLists(userID, limit = 50, offset = 0) {
    if (isNaN(limit)) {
      throw new HTTPError('invalid limit', 422)
    }

    if (isNaN(offset)) {
      throw new HTTPError('invalid offset', 422)
    }

    return await this.listsModel.listByUserID(userID, limit, offset)
  }
}

module.exports = Lists