'use strict';

const MAILGUN_APIKEY = process.env.MAILGUN_APIKEY
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN

const mailgun = require('mailgun-js')({
  apiKey: MAILGUN_APIKEY,
  domain: MAILGUN_DOMAIN
});

const fromAddress = `<blake@${MAILGUN_DOMAIN}>`;
const subjectText = "Yoyoyo - what up";
const messageText = 'This is an email invokved by a lambda function :D.';
const messageHtml = `
<html>
  <title>Such styles</title>
  <body>
    <div>
      <h1>The bears suck</h1>
    </div>
  </body>
</html>
`;

module.exports.sendEmail = (event, context, callback) => {
  let toAddress = '';

  if (event.body) {
    try {
      toAddress = JSON.parse(event.body).to_address || '';
    } catch (err) {
      console.log('Error : ', err);
    }
  }

  if (!toAddress) {
    const err = {
      statusCode: 422,
      body: JSON.stringify({
        message: 'Bad input data or missing email address',
        input: event.body,
      }),
    };

   return callback(null, err);
  }

  const emailData = {
      from: fromAddress,
      to: toAddress,
      subject: subjectText,
      text: messageText,
      html: messageHtml
  };

  mailgun.messages()
    .send(emailData, (err, body) => {
      if (err) {
        return callback(err);
      } else {
        const response = {
          statusCode: 202,
          body: JSON.stringify({
            message: 'Request to send email was successful!',
            input: body,
          }),
        };

        return callback(null, response);
      }
    });
};
