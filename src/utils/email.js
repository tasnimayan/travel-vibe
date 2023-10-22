const nodemailer = require("nodemailer");
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SG_API_KEY);


// module.exports = {
// 	welcomeEmail(user, url) {
// 		sgMail.send({
// 			to: user.email,
// 			from: hostMail,
// 			subject: `${user.name}, welcome to your Touring Experience!`,
// 			text: `Thank you for joining us here at Touring. You can check out more info at this link ${url}`,
// 		});
// 	},

// 	cancelAccountEmail(user, url) {
// 		sgMail.send({
// 			to: user.email,
// 			from: hostMail,
// 			subject: `Sorry to see you leave ${user.name}!`,
// 			text: `If you could state out the reason of your leave, it would be very helpful in the future. Come visit us again at ${url} GGWP`,
// 		});
// 	},

// 	resetPasswordEmail(user, url) {
// 		sgMail.send({
// 			to: user.email,
// 			from: hostMail,
// 			subject: `Reset your password ${user.name} (valid for 15 mins)`,
// 			text: `Here is your reset password link:
//       ${url}
//        If you did not forget your password, ignore this email`,
// 		});
// 	},

// 	reactivateAccountEmail(user, url) {
// 		sgMail.send({
// 			to: user.email,
// 			from: hostMail,
// 			subject: `Reactivate your account ${user.name}!`,
// 			text: `${user.name}Here is the link to reactivate your account: ${url} `,
// 		});
// 	},
// };


const transporter = nodemailer.createTransport({
  // provide your web mail <info.travelVibe@web.com>
  host: "smtp.forwardemail.net",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'REPLACE-WITH-YOUR-ALIAS@YOURDOMAIN.COM',
    pass: 'REPLACE-WITH-YOUR-GENERATED-PASSWORD'
  }
});

// async..await is not allowed in global scope, must use a wrapper
async function mailSender(user, mailFor, otp) {

  const hostMail = process.env.HOST_MAIL;
  // Different types of messages for different operations
  const messages = {
    welcome:{sub:"", msg:""},
    cancelAccount:{sub:"", msg:""},
    resetPassword:{sub:"", msg:""}
  }

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: hostMail, // sender address
    to: user.email, // list of receivers
    subject: messages.welcome.sub, // Subject line
    text: messages.welcome.msg, // plain text body
    html: "<br>Your Regards </br>Travel Vibe</b>", // html body
  });

  

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = mailSender;
