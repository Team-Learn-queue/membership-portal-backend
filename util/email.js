const dotenv = require("dotenv");
const postmark = require("postmark");

dotenv.config();
exports.generateOTP = () => {
  let otp;

  for (let i = 0; i <= 3; i++) {
    const randVal = Math.round(Math.random() * 9);
    otp = otp + randVal;
  }
  return otp;
};



const client = new postmark.ServerClient(process.env.POSTMARK_KEY);
exports.verifyEmailTemplate = (user, emailLink) => {
  return client.sendEmail({
    From: "info@anstesters.com",
    To: `${user.email}`,
    Subject: "We are thrilled to have you",
    HtmlBody: `<html>
    <head>
      <title>Email Template</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap" rel="stylesheet">
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;800&display=swap");
  
        body {
          font-family: "Poppins";
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0">
    <div
    style="
      font-family: 'Poppins';
      
      text-align: center;
    "
  >
   
    <p style="margin-top: 20px;font-family: Poppins; text-transform: capitalize;">Hello ${user.first_name} ${user.last_name},</p>
    <p style="margin-top: 20px;font-family: 'Poppins';">
      Thank you for joining ANSTESTERS and we are pleased to welcome you as registered user.
    </p>
    <p style="margin-top: 20px;font-family: 'Poppins';">
      Kindly click on the button below to confirm your account.
    </p>
    <div style="margin-top: 70px">
      <a
        style="
          margin: 0 auto;
          background-color: #2d4f93;
          font-size: 15px;
          text-decoration: none;
          padding: 15px 30px;
          color: white;
          display: inline-block;
          border-radius: 100px;
          font-weight: 600;
          font-family: 'Poppins';
        "
        href="${emailLink}"
        >Confirm my account</a
      >
    </div>
  </div>
  
    </body>
  </html>
  
            `,
  });
};

exports.forgotEmailTemplate = (user, resetLink) => {
  return client.sendEmail({
    From: "info@anstesters.com",
    To: `${user.email}`,
    Subject: "You Have Requested to Reset Your Password",
    HtmlBody: `<html>
  <head>
    <title>Email Template</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
   
  </head>
  <body style="margin: 0; padding: 0">
  <div
  style="
    font-family: 'Poppins';
    
    text-align: center;
  "
>
<p style="margin-top: 20px;font-family: 'Poppins'; text-transform: capitalize;">Hello ${user.first_name} ${user.last_name},</p>
<p style="margin-top: 20px;font-family: 'Poppins';">
  We received a request for password reset for your account as a user.
</p>

    
    
    <p style="margin-top: 20px">Please click on the link and follow the process.</p>
    <div style="margin-top: 70px">
      <a
        style="
        margin: 0 auto;
        background-color: #2d4f93;
        font-size: 15px;
        text-decoration: none;
        padding: 15px 30px;
        color: white;
        display: inline-block;
        border-radius: 100px;
        font-weight: 600;
        font-family: 'Poppins';
        "
        href="${resetLink}"
        >Reset Password</a
      >
    </div>
    </div>
  </body>
</html>

        `,
  });
};

exports.passwordSetTemplate = (user) => {
  return client.sendEmail({
    From: "info@anstesters.com",
    To: `${user.email}`,
    Subject: "Password Reset Sucessfully",
    HtmlBody: `<html>  
    <head>
    <title>Email Template</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
   
  </head>
  <body style="margin: 0; padding: 0">
  <div
  style="
    font-family: 'Poppins';
    
    text-align: center;
  "
>
   
    <p style="margin-top: 20px">Your Password has been reset sucessfully</p>
    <p style="margin-top: 20px">Now you can login with your new password</p>

    </div>
  </body>
</html>

        `,
  });
};

exports.verifiedTemplate = (user) => {
  return client.sendEmail({
    From: "info@anstesters.com",
    To: `${user.email}`,
    Subject: "Email verified sucessfully",
    HtmlBody: `<html>
  
  <head>
    <title>Email Template</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
   
  </head>
  <body style="margin: 0; padding: 0">
  <div
  style="
    font-family: 'Poppins';
    
    text-align: center;
  "
>
   
    <p style="margin-top: 20px; text-transform: capitalize" > ${user.first_name} ${user.last_name}, You are welcome to ANSTESTERS Forum</p>
    <p style="margin-top: 20px">Thank you for connecting with us.</p>

    </div>
  </body>
</html>

        `,})
};
