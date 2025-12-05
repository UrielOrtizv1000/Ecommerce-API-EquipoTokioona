// utils/sendEmail.js
// const transporter = require("../config/email"); // Usa Nodemailer transporter

// async function sendEmail({ to, subject, html, attachments = [] }) {
//     const mailOptions = {
//         from: `"Tokioona" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//         attachments
//     };

//     return transporter.sendMail(mailOptions); // Llama al método de Nodemailer
// }

// module.exports = sendEmail;
// utils/sendEmail.js (Versión SendGrid mejorada)

const sgMail = require("@sendgrid/mail");
const fs = require('fs').promises; // Usamos la versión de promesas
const path = require('path'); // Para manejar rutas

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail({ to, subject, html, attachments = [] }) {
    
    // Convertir attachments a formato Base64 para SendGrid
    const sendGridAttachments = await Promise.all(
        attachments.map(async (attachment) => {
            let content;
            let type;

            if (attachment.path) {
                // 1. Leer el archivo y codificarlo en Base64
                content = await fs.readFile(attachment.path, 'base64');
                // 2. Determinar el tipo MIME (ej: application/pdf)
                type = path.extname(attachment.path) === '.pdf' ? 'application/pdf' : 'application/octet-stream';
            } else if (attachment.content) {
                // Si el contenido ya está en Base64 o como buffer
                content = attachment.content;
                type = attachment.type || 'application/octet-stream';
            }

            return {
                content, // Contenido codificado en Base64
                filename: attachment.filename,
                type: type,
                disposition: attachment.cid ? 'inline' : 'attachment', 
                content_id: attachment.cid // USAMOS content_id, el campo esperado por SendGrid API (y a veces la librería)
            };
        })
    );

    const msg = {
        from: {
            name: "Tokioona",
            email: process.env.VERIFIED_SENDER_EMAIL, 
        },
        to,
        subject,
        html,
        attachments: sendGridAttachments,
    };

    // Envía el correo
// utils/sendEmail.js
    // Envía el correo
    try {
        const [response] = await sgMail.send(msg);
        return response; 
    } catch (error) {
        // AÑADE ESTO: Muestra el body para obtener el array de errores
        if (error.response && error.response.body && error.response.body.errors) {
            console.error("ERRORES DETALLADOS DE SENDGRID:", JSON.stringify(error.response.body.errors, null, 2));
        }
        throw error;
    }
}

module.exports = sendEmail;
