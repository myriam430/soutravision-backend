// index.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();
app.use(cors());
app.use(express.json());

// Vérifie que la clé API est bien présente
if (!process.env.BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY manquante dans le .env");
  process.exit(1);
}

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Vérifie que le front envoie bien ces données
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "Champs manquants" });
  }

  console.log("📧 Tentative d'envoi d'email...");
  console.log("👤 Client:", name, "(", email, ")");

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    sender: {
      email: "infos@soutravision.com", // Email Brevo par défaut (déjà vérifié)
      name: "Soutravision",
    },
    to: [
      {
        email: "adadohmyriam@gmail.com", // ← ICI : L'email qui REÇOIT les messages
        name: "Service Client Soutravision",
      },
    ],
    replyTo: {
      email: email, // Email du client
      name: name,
    },
    subject: "📧 Nouveau message depuis le site Soutravision",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
          <h1 style="color: #333; margin: 0;">SOUTRAVISION</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Nouveau message de contact</p>
        </div>
        
        <div style="padding: 20px;">
          <div style="background: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #2c3e50;">👤 Informations du contact</h3>
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Date :</strong> ${new Date().toLocaleString("fr-FR")}</p>
          </div>
          
          <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="color: #2c3e50;">💬 Message :</h3>
            <p style="white-space: pre-line; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px; font-size: 14px; color: #666;">
            <p><strong>⚠️ Pour répondre :</strong> Cliquez sur "Répondre" dans votre client email.</p>
            <p>Le client recevra directement votre réponse à l'adresse : <strong>${email}</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
          <p>Cet email a été envoyé automatiquement depuis le formulaire de contact du site Soutravision.</p>
          <p>© ${new Date().getFullYear()} Soutravision - Tous droits réservés</p>
        </div>
      </div>
    `,
  });

  try {
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ EMAIL ENVOYÉ AVEC SUCCÈS !");
    console.log("📨 Destinataire : infos@soutra.com");
    console.log("📊 Réponse Brevo :", response);

    res.json({
      success: true,
      message: "Votre message a été envoyé à infos@soutra.com",
    });
  } catch (error) {
    console.error("❌ ERREUR BREVO :");
    console.error("Code erreur:", error?.response?.body?.code);
    console.error("Message:", error?.response?.body?.message);
    console.error("Détails:", error?.response?.body || error.message);

    res.status(500).json({
      success: false,
      message: "Désolé, une erreur est survenue lors de l'envoi",
      error: error?.response?.body?.message || "Erreur technique",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ Serveur lancé sur le port ${PORT}`));
