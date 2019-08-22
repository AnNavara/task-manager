const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'navarachkou@gmail.com',
    subject: 'Welcome to the automationverse',
    text: `Welcome to the App, ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'navarachkou@gmail.com',
    subject: `Goodbye, ${name}`,
    text: 'I hope you had good time with automationverse!'
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}