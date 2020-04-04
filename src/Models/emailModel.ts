import nodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Config from '../config';

interface IProps {
    destinationEmail: string;
    subject: string;
    body: string;
}

function sendEmail({ destinationEmail, subject, body }: IProps): Promise<void> {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: Config.EMAIL_USER,
            pass: Config.EMAIL_PASSWORD,
        }
    });

    let mailOptions: Mail.Options = {
        to: destinationEmail,
        subject: subject,
        html: body
    };

    return transporter.sendMail(mailOptions);
}

export default sendEmail;