import nodemailer from 'nodemailer';

interface EmailInterface {
  receiver: string,
  html: string
}

export async function nodemailerService(options: EmailInterface) {

  let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "lee36@ethereal.email", // generated ethereal user
        pass: "GUK811cH5PZs1B4jFc", // generated ethereal password
      }
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: options.receiver, // list of receivers
    subject: "Change Password", // Subject line
    html: options.html 
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Receiver: %s", info.to);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}