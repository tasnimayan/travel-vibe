const nodemailer = require('nodemailer')
require('dotenv').config();

const EmailSend = async (emailTo, emailText, emailSub)=>{

  let transport = nodemailer.createTransport({
    host:'tasnimayan.dev',
    port:465, //587 if is secure is false or 465 if true
    secure:true,
    auth:{
      user:process.env.HOST_MAIL,
      pass:process.env.MAIL_PASS
    },
    tls:{rejectUnauthorized:false}
  })

  let mailOption = {
    from:process.env.HOST_MAIL,
    to:emailTo,
    subject:emailSub,
    text:"Welcome to site",
    html:emailText
  }

  return await transport.sendMail(mailOption)
}

module.exports = EmailSend;