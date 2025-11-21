/*Here u are going to receibe an email7
then generate a coupon and reesend an answer
with the coupon, log, name and motto  */

const sendEmail = require("../utils/sendEmail");

exports.subscribe = async(req, res) =>{
    try{
        const{email} = req.body;
        if(!email){
            return res.status(400).json({message: "Se requiere un email"});
        }
        // generate a coupon
        const coupon = "DESC10-" + Math.random().toString(36).substring(2,8).toUpperCase(); 
        // remember tu put a logo later (Gael Emiliano)
        const html = `
            <h1>¡Gracias por suscribirte!</h1>
            <img src="https://tu-logo.com/logo.png" width="120" />

            <p>Aquí está tu cupón de bienvenida:</p>

            <h2 style="color:#d9534f;">${coupon}</h2>

            <p>Mi Empresa — <i>"Lema de la tienda"</i></p>
        `;
        await sendEmail({ // wait a promise to send a email
            to: email,
            subject: "Cupón de suscripción",
            html
        });

        res.json({message: "Cupón enviado", coupon});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error al enviar el cupón" });
    }
};