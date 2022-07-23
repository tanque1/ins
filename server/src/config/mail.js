const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c5f2fffa542326",
      pass: "f58a706240bff8"
    }
  });

module.exports = transport