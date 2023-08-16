const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const cors = require('cors')
const { Client } = require('pg')
const {
  Users: UsersModel,
  Lists: ListsModel,
  Tags: TagsModel,
} = require('./models')
const {
  Users: UsersController,
  Lists: ListsController,
  Mails: MailsController } = require('./controllers')
const {
  Users: UsersAPI,
  Lists: ListsAPI,
} = require('./apis')
const { authenticate } = require('./middlewares')
const { USER_STATUSES, LIST_STATUSES, TASK_STATUSES } = require('./constants')

async function initTypes(pgClient) {
  const resps = await Promise.all([
    pgClient.query(`
      SELECT typname FROM pg_type WHERE
      typname='user_status' OR
      typname='list_status' OR
      typname='task_status';
    `)
  ])

  const genTypeOpr = [
    pgClient.query(`CREATE TYPE user_status AS ENUM (${Object.values(USER_STATUSES).map(status => `'${status}'`).join(', ')});`),
    pgClient.query(`CREATE TYPE list_status AS ENUM (${Object.values(LIST_STATUSES).map(status => `'${status}'`).join(', ')});`),
    pgClient.query(`CREATE TYPE task_status AS ENUM (${Object.values(TASK_STATUSES).map(status => `'${status}'`).join(', ')});`)
  ]
  resps
    .map(resp => resp.rows)[0]
    .forEach(type => {
      if (type.typname === 'user_status') {
        genTypeOpr[0] = undefined
      }

      if (type.typname === 'list_status') {
        genTypeOpr[1] = undefined
      }

      if (type.typname === 'task_status') {
        genTypeOpr[2] = undefined
      }
    })

  await Promise.all(genTypeOpr)
}

async function main() {
  try {
    const app = express()
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      ssl: true
    })

    await client.connect()
    // await initTypes(client)

    const mailsController = MailsController.getInstance()

    /**
     * @description users domain
     */
    const usersModel = UsersModel.getInstance(client)
    const usersController = UsersController.getInstance(usersModel, mailsController)
    const usersAPI = UsersAPI.getInstance(usersController)

    /**
     * @description lists domain
     */
    const listsModel = ListsModel.getInstance(client)
    const listsController = ListsController.getInstance(listsModel)
    const listsAPI = ListsAPI.getInstance(listsController)

    /**
     * @description tasks domain
     */

    /**
     * @description tags domain
     */
    const tagsModel = TagsModel.getInstance(client)

    await Promise.all([
      usersModel.createTable(),
      listsModel.createTable(),
      tagsModel.createTable()
    ])

    app.use(
      cors(),
      morgan('dev'),
      bodyParser.json(),
      cookieParser()
    )

    app
      .use('/v1/users', usersAPI.serve())
      .use('/v1/lists', authenticate, listsAPI.serve())

    app.listen(
      process.env.PORT,
      () => console.log(`App running on port ${process.env.PORT}`)
    )
  } catch (e) {
    console.error(e)
  }
}

main()