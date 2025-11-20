/*this needs to recibe:
name,email,message 
and send an email to the user with some message */

const sendEmail = require("../utils/sendEmail");

exports.sendContactMessage = async (req,res) => {
    try{
        const {name, email, message} = req.body;
        if(!name || !email || !message){ // verify if had name, email and message
            return res.status(400).json({message: "Se requiere llenar todos los campos"});
        }
        const html = ` 
            <h1>Mi Empresa</h1>
            <img src="https://tu-logo.com/logo.png" width="120" />

            <p>Hola <strong>${name}</strong>,</p>
            <p>Hemos recibido tu mensaje:</p>
            <blockquote>${message}</blockquote>

            <p><strong>En breve serás atendido.</strong></p>
            <p><i>"Lema de la empresa"</i></p>
        `; // send this in html

        await sendEmail({ // wait a promise
            to: email,
            subject: "Tu mensaje ha sido recibido",
            html
        });

        res.json({ message: "Correo enviado correctamente"})
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Error al enviar el correo" });
    }
};