// back/controllers/subscriptionController.js
const sendEmail = require("../utils/sendEmail");
const pool = require("../db/conexion");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere un email"
      });
    }

    // Guardar en BD (evitando duplicados)
    await pool.query(
      `INSERT IGNORE INTO subscriptions (email) VALUES (?)`,
      [email]
    );

    const coupon = "WELCOME5";

    const html = `
    <div style="
      font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
      background-color:#f5f5f7;
      padding:24px;
      color:#1d1d1f;
    ">
      <div style="
        max-width:600px;
        margin:0 auto;
        background:#ffffff;
        border-radius:18px;
        padding:24px 28px;
        box-shadow:0 10px 30px rgba(0,0,0,0.08);
      ">
        <h1 style="
          font-size:24px;
          margin:0 0 12px;
          color:#111827;
        ">
          ¡Gracias por suscribirte a <span style="color:#2563eb;">Tokioona</span>!
        </h1>

        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;">
          Hola, <b>${email}</b> 👋
        </p>

        <p style="margin:0 0 14px;font-size:14px;line-height:1.6;">
          Te has unido a nuestra lista de suscripción. 
          A partir de ahora recibirás novedades, ofertas especiales y noticias
          sobre los juguetes más chidos de la tienda.
        </p>

        <div style="
          margin:22px 0;
          padding:16px 18px;
          background:linear-gradient(135deg,#2563eb,#7c3aed);
          border-radius:16px;
          color:#f9fafb;
          text-align:center;
        ">
          <p style="margin:0 0 8px;font-size:14px;">
            Este es tu cupón de bienvenida:
          </p>
          <div style="
            display:inline-block;
            padding:10px 18px;
            border-radius:999px;
            background:rgba(15,23,42,0.85);
            letter-spacing:3px;
            font-weight:700;
            font-size:16px;
          ">
            ${coupon}
          </div>
          <p style="margin:10px 0 0;font-size:12px;opacity:0.9;">
            Úsalo en tu próxima compra para obtener un descuento especial.
          </p>
        </div>

        <p style="margin:0 0 10px;font-size:13px;line-height:1.6;">
          Si tú no solicitaste esta suscripción, simplemente ignora este correo.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0;"/>

        <p style="margin:0;font-size:12px;color:#6b7280;">
          Tokioona — <i>"Recordar es volver a jugar"</i><br/>
          Gracias por formar parte de nuestra comunidad de jugadores.
        </p>
      </div>
    </div>
    `;

    await sendEmail({
      to: email,
      subject: "🎁 ¡Bienvenido a Tokioona! Aquí está tu cupón de bienvenida",
      html
    });

    return res.status(200).json({
      ok: true,
      message: "Correo enviado con tu cupón de bienvenida.",
      coupon
    });

  } catch (error) {
    console.error("Error en subscribe:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al procesar la suscripción."
    });
  }
};
