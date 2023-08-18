class Lists {
  static instance

  constructor(pgClient) {
    this.pgClient = pgClient
  }

  static getInstance(pgClient) {
    if (!Lists.instance) {
      Lists.instance = new Lists(pgClient)
    }

    return Lists.instance
  }

  async createTable() {
    try {
      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS lists (
          id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          status list_status NOT NULL,
          title_color VARCHAR(7),
          user_id INTEGER REFERENCES users (id) NOT NULL,
          created_at TIMESTAMP NOT NULL,
          updated_at TIMESTAMP NOT NULL
        );
      `)
    } catch (err) {
      throw err
    }
  }

  async createOneByUserID(title, userID) {
    try {
      const baseQuery = `
        INSERT INTO
          lists(
            title,
            user_id
          )
        VALUES (
          '${title}',
          '${userID}'
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

  async getManyByUserID(userID, limit, offset) {
    try {
      const baseQuery = `
        SELECT * FROM lists
        WHERE user_id='${userID}'
        LIMIT ${limit}
        OFFSET ${offset};
      `

      console.log(baseQuery)
      const resp = await this.pgClient.query(baseQuery)

      return resp.rows ?? []
    } catch (err) {
      throw err
    }
  }
}

module.exports = Lists 