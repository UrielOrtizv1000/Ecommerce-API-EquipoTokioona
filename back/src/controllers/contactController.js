const sendEmail = require("../utils/sendEmail");

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const html = `
      <h1>Tokioona</h1>
      <a href="https://ibb.co/HpLMB8FL">
        <img src="https://i.ibb.co/TqDnY3vD/logo-mock.png" alt="Tokioona logo" border="0" width="120" />
      </a>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We have received your message:</p>
      <blockquote>${message}</blockquote>
      <p><strong>Our team will contact you shortly.</strong></p>
      <p><i>"Recordar es volver a jugar"</i></p>
    `;

    await sendEmail({
      to: email,
      subject: "Your message has been received",
      html,
    });

    return res.json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Contact email error:", error);
    return res.status(500).json({ message: "Error sending email." });
  }
};
