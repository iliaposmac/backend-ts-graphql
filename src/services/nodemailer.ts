import nodemailer from 'nodemailer';

interface EmailInterface {
  receiver: string,
  html: string
}

export async function nodemailerService(options: EmailInterface) {

  let testAccount = await nodemailer.createTestAccount();
  console.log(testAccount);

  let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "nx4plp6vwbokxvcm@ethereal.email", // generated ethereal user
        pass: "vRt2cYqqpyBsjhHbed", // generated ethereal password
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

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}