import nodemailer from "nodemailer"
// const Email = require('email-templates')
// var nodemailer = require('nodemailer');



async function sendEMAIL() {
  let transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
      user: "api",
      pass: "075f4c4110a7dac07df98d41406c4d41",
    }
  });

  let info = await transporter.sendMail({
    from: "info@demomailtrap.com",
    to: "haidvxls@gmail.com",
    subject: "kiểm thử gửi email",
    text: "kiểm thử email thành công",
  });

  console.log("Message sent: %s", info.messageId);
}

sendEMAIL().catch(console.error)