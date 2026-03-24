const fs = require("fs").promises;
const path = require("path");

const sgMail = require("@sendgrid/mail");

const MIME_TYPES = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
};

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

async function sendEmail({ to, subject, html, attachments = [] }) {
  if (!process.env.SENDGRID_API_KEY || !process.env.VERIFIED_SENDER_EMAIL) {
    throw new Error("Email service is not configured.");
  }

  const formattedAttachments = await Promise.all(
    attachments.map(async (attachment) => {
      let content = attachment.content;
      let type = attachment.type || "application/octet-stream";

      if (attachment.path) {
        const extension = path.extname(attachment.path).toLowerCase();
        content = await fs.readFile(attachment.path, "base64");
        type = MIME_TYPES[extension] || type;
      }

      return {
        content,
        filename: attachment.filename,
        type,
        disposition: attachment.cid ? "inline" : "attachment",
        content_id: attachment.cid,
      };
    })
  );

  const message = {
    from: {
      name: "Tokioona",
      email: process.env.VERIFIED_SENDER_EMAIL,
    },
    to,
    subject,
    html,
    attachments: formattedAttachments,
  };

  try {
    const [response] = await sgMail.send(message);
    return response;
  } catch (error) {
    if (error.response?.body?.errors) {
      console.error(
        "SendGrid detailed errors:",
        JSON.stringify(error.response.body.errors, null, 2)
      );
    }
    throw error;
  }
}

module.exports = sendEmail;
