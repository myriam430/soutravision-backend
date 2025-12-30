// index.js - VERSION CORRIGÉE
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

// Configuration Brevo CORRECTE
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "Tous les champs sont requis" 
    });
  }

  console.log("📧 Tentative d'envoi d'email...");
  console.log("👤 Client:", name, "(", email, ")");

  // CRÉATION SIMPLIFIÉE et CORRECTE de l'email
  const sendSmtpEmail = {
    sender: {  // FORMAT EXACT REQUIS PAR BREVO
      email: "infos@soutravision.com",  // CHANGE ÇA SI NÉCESSAIRE
      name: "Soutravision"
    },
    to: [{
      email: "infos@soutravision.com",
      name: "Service Client"
    }],
    replyTo: {
      email: email,
      name: name
    },
    subject: "Nouveau message depuis le site",
    htmlContent: `
      <h3>Nouveau message</h3>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Message :</strong> ${message}</p>
    `
  };

  console.log("🔍 Objet email à envoyer :");
  console.log(JSON.stringify(sendSmtpEmail, null, 2));

  try {
    console.log("🔄 Envoi en cours vers Brevo...");
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ SUCCÈS ! Email envoyé.");
    console.log("📊 Réponse:", response);
    
    res.json({ 
      success: true, 
      message: "Message envoyé avec succès" 
    });
  } catch (error) {
    console.error("❌ ERREUR COMPLÈTE:");
    console.error("Status:", error.status);
    console.error("Body:", error.body);
    console.error("Text:", error.text);
    console.error("Headers:", error.headers);
    
    // SOLUTION DE SECOURS - Essaye un sender différent
    console.log("\n🔄 Essayons avec un sender alternatif...");
    
    // Essaie avec un sender Brevo par défaut
    sendSmtpEmail.sender = {
      email: "notification@brevo.com",
      name: "Soutravision"
    };
    
    console.log("Nouveau sender:", sendSmtpEmail.sender);
    
    try {
      const retryResponse = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log("✅ SUCCÈS avec sender alternatif !");
      res.json({ 
        success: true, 
        message: "Message envoyé avec succès (sender alternatif)" 
      });
    } catch (retryError) {
      console.error("❌ Échec même avec sender alternatif");
      res.status(500).json({ 
        success: false, 
        message: "Erreur serveur. Veuillez nous contacter directement." 
      });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✓ Serveur lancé sur le port ${PORT}`));
