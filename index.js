const express = require("express");
require("dotenv").config();
const cors = require("cors");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
  sender: {
      email: process.env.BREVO_FROM,
      name: "Soutravision",
    },
    to: [{ email: process.env.BREVO_FROM }],
    replyTo: {
      email: email,
      name: name,
    },
    subject: "Nouveau message de contact",
    htmlContent: `
      <h3>Nouveau message</h3>
      <p><b>Nom :</b> ${name}</p>
      <p><b>Email :</b> ${email}</p>
      <p>${message}</p>
    `,
  });

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    res.json({ success: true, message: "Email envoyé" });
  } catch (error) {
    console.error("Brevo error:", error.response?.body || error);
    res.status(500).json({ success: false, message: "Erreur email" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("✓ Serveur lancé"));
