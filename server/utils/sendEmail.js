import nodemailer from "nodemailer";

export function sendConfirmationEmail(toEmail, userName) {
  const emailSender = process.env.SENDER_EMAIL;
  const emailPassword = process.env.EMAIL_PASS;
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
          <a href=http://localhost:3000/create-reset-password/${toEmail}> Click here to complete the signup process</a>
          <h3>Advertise as never before...<br>
          Regards<br>
          Monad<br>
          by Vinciis</h3>
          </div>`,
    })
    .catch((err) => console.log(err));
}
