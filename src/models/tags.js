class Tags {
  static instance

  constructor(pgClient) {
    this.pgClient = pgClient
  }

  static getInstance(pgClient) {
    if (!Tags.instance) {
      Tags.instance = new Tags(pgClient)
    }

    return Tags.instance
  }

  async createTable() {
    try {
      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS tags (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          bg_color VARCHAR(7),
          txt_color VARCHAR(7),
          created_at TIMESTAMP
        );
      `)
    } catch (err) {
      throw err
    }
  }

}

module.exports = Tags