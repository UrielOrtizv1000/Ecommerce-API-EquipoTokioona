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
            <h1>Tokioona</h1>
            <a href="https://ibb.co/HpLMB8FL"><img src="https://i.ibb.co/TqDnY3vD/logo-mock.png" alt="logo-mock" border="0" width="120" /></a>

            <p>Hello <strong>${name}</strong>,</p>
            <p>We have received your message:</p>
            <blockquote>${message}</blockquote>

            <p><strong>You will be attended shortly.</strong></p>
            <p><i>"Recordar es volver a jugar"</i></p>
        `; // send this in html

        await sendEmail({ // wait a promise
            to: email,
            subject: "Your message has been received",
            html
        });

        res.json({ message: "Email sent successfully"})
    } catch (error){
        console.error(error);
        res.status(500).json({ message: "Error sending email" });
    }
};