// utils/sendEmail.js
const transporter = require("../config/email");

async function sendEmail({ to, subject, html, attachments = [] }) {
    const mailOptions = {
        from: `"Tokioona" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
