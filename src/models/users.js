const { USER_STATUSES } = require('../constants')

class Users {
  static instance

  constructor(pgClient) {
    this.pgClient = pgClient
  }

  static getInstance(pgClient) {
    if (!Users.instance) {
      Users.instance = new Users(pgClient)
    }

    return Users.instance
  }

  async createTable() {
    try {
      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          dob DATE NOT NULL,
          username VARCHAR(50) NOT NULL UNIQUE,
          email VARCHAR NOT NULL UNIQUE,
          hash VARCHAR NOT NULL,
          password VARCHAR NOT NULL,
          status user_status NOT NULL,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
        );
      `)
    } catch (err) {
      throw err
    }
  }

  async getOneByUsernameOrEmail(username, email) {
    try {
      let baseQuery = `SELECT * FROM users WHERE email='${email}' OR username='${username}';`

      console.log(baseQuery)
      const resp = await this.pgClient.query(baseQuery)

      return resp.rows?.[0] ?? null
    } catch (err) {
      throw err
    }
  }

  async getOneByEmail(email) {
    try {
      let baseQuery = `SELECT * FROM users WHERE email='${email}';`

      console.log(baseQuery)
      const resp = await this.pgClient.query(baseQuery)

      return resp.rows?.[0] ?? null
    } catch (err) {
      throw err
    }
  }

  async getOneByUsername({ username }) {
    try {
      let baseQuery = `
        SELECT
          id,
          first_name,
          last_name,
          dob,
          email,
          hash,
          password,
          status,
          created_at,
          updated_at
        FROM 
          users
        WHERE
          username='${username}'
        LIMIT 1;
      `

      console.log(baseQuery)
      const resp = await this.pgClient.query(baseQuery)

      return resp.rows?.[0] ?? null
    } catch (err) {
      throw err
    }
  }

  async createOne({ first_name, last_name, dob, email, username, hash, password }) {
    try {

      // FIXME: - Store password inside DB
      const baseQuery = `
        INSERT INTO users(
          first_name,
          last_name,
          dob,
          email,
          username,
          hash,
          password,
          status,
          created_at,
          updated_at
        )  
        VALUES (
          '${first_name}',
          '${last_name}',
          '${dob}',
          '${email}',
          '${username}',
          '${hash}',
          '${password}',
          '${USER_STATUSES.UNVERIFIED}',
          NOW(),
          NOW()
        )
        RETURNING *;
      `

      console.log(baseQuery)
      const resp = await this.pgClient.query(baseQuery)

      return resp.rows?.[0] ?? null
    } catch (err) {
      throw err
    }
  }
}

module.exports = Users