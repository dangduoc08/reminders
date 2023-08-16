const nodemailer = require('nodemailer');

class Mails {
  static instance

  transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    auth: {
      user: 'duocdevtest',
      pass: process.env.GMAIL_PASSWORD
    }
  })

  static getInstance() {
    if (!Mails.instance) {
      Mails.instance = new Mails()
    }


    return Mails.instance
  }

  async send(subject, to, content) {
    this.transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      text: content
    })
  }

}

module.exports = Mails