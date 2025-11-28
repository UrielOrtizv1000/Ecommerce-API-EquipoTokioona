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
        const coupon = "WELCOME5"; 
        // remember tu put a logo later (Gael Emiliano)
        const html = `
            <h1>¡Thanks for subscribe!</h1>
           <a href="https://ibb.co/HpLMB8FL"><img src="https://i.ibb.co/TqDnY3vD/logo-mock.png" alt="logo-mock" border="0" width="120"/></a>

            <p>Here is your welcome coupon:</p>

            <h2 style="color:#d9534f;">${coupon}</h2>

            <p>Tokioona — <i>"Recordar es volver a jugar"</i></p>
        `;
        await sendEmail({ // wait a promise to send a email
            to: email,
            subject: "Sub cuopon",
            html
        });

        res.json({message: "Coupon send", coupon});
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Error send the coupon" });
    }
};