class Tasks {
  static instance

  constructor(pgClient) {
    this.pgClient = pgClient
  }

  static getInstance(pgClient) {
    if (!Tasks.instance) {
      Tasks.instance = new Tasks(pgClient)
    }

    return Tasks.instance
  }

  async createTable() {
    try {
      await this.pgClient.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          title VARCHAR(100) NOT NULL,
          content TEXT,
          list_id INTEGER REFERENCES lists (id) NOT NULL,
          task_ids INTEGER[] REFERENCES tags (id),
          created_at TIMESTAMP,
          updated_at TIMESTAMP
        );
      `)
    } catch (err) {
      throw err
    }
  }

}

module.exports = Tasks