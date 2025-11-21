const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // get the email and the password from .env
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail({to, subject, html, attachments = []}) {
    try{
        const info = await transporter.sendMail({
            from: `"Mi Tienda" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            attachments,
        });
        console.log("Email enviado: ", info.messageId);
        return info;
    }catch(error){
        console.error("Error enviando email:", error);
        throw error;
    }
}
module.exports = sendEmail;