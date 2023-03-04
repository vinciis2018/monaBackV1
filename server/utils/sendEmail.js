import nodemailer from "nodemailer";

export function sendConfirmationEmail(
  toEmail,
  userName,
  requestCameFromURL,
  req,
  res
) {
  const emailSender = process.env.SENDER_EMAIL || "testgamil4@gmail.com";
  const emailPassword = process.env.EMAIL_PASS || "wcwzgvbanoydwpmu";
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: emailSender,
      pass: emailPassword,
    },
  });

  console.log("sending email to user");
  console.log(requestCameFromURL);
  transporter
    .sendMail({
      from: emailSender, // sender address
      to: toEmail, // list of receivers
      subject: "Please confirm your account",
      html: `
          <h2>Hello ${userName}</h2>
          <p>Thank you for signing up on Monad. Please Click on the link below, to complete
          your signin up process. We will be keeping your email for future updates and
          information. Please visit www.vinciis.in for more details on privacy policy.</p>
          <a href=${requestCameFromURL}create-reset-password/${toEmail}/${userName}> Click here to complete the signup process</a>
          <h3>Advertise as never before...<br>
          Regards<br>
          Monad<br>
          by Vinciis</h3>
          </div>`,
    })
    .then((data) => {
      console.log("Email has send to your email :", toEmail);
      return res.status(400).send({
        message: `Email sent to your ragistered email ${toEmail}`,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).send({
        message:
          "Email Not sent to your ragistered email. Ckeck your email and resend.",
      });
    });
}
