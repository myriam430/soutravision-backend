// index.js - VERSION CORRIGÉE AVEC TOUS LES CHAMPS
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
  // CORRECTION ICI : AJOUT DES NOUVEAUX CHAMPS
  const { name, email, company, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: "Nom, email et message sont requis" 
    });
  }

  console.log("📧 Tentative d'envoi d'email...");
  console.log("👤 Client:", name, "(", email, ")");
  console.log("🏢 Entreprise:", company || "Non renseigné");
  console.log("📞 Téléphone:", phone || "Non renseigné");
  console.log("🎯 Service:", service || "Non spécifié");

  // CRÉATION SIMPLIFIÉE et CORRECTE de l'email
  const sendSmtpEmail = {
    sender: {  // FORMAT EXACT REQUIS PAR BREVO
      email: "infos@soutravision.com",  // Email vérifié de Soutravision
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
    subject: `Nouveau message: ${service || "Demande générale"} - ${company || name}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2c3e50;">📧 Nouveau message</h2>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
          <h3 style="margin-top: 0;">👤 Informations du contact</h3>
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Téléphone :</strong> ${phone || "Non renseigné"}</p>
          <p><strong>Entreprise :</strong> ${company || "Non renseigné"}</p>
          <p><strong>Service intéressé :</strong> ${service || "Non spécifié"}</p>
          <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        
        <div style="background: #e8f4fd; padding: 15px; border-radius: 5px;">
          <h3>💬 Message :</h3>
          <p style="white-space: pre-line;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 12px; color: #666;">
          <p>Cet email a été envoyé automatiquement depuis le formulaire de contact du site Soutravision.</p>
        </div>
      </div>
    `,
    textContent: `
Nouveau message 
-------------------------
Nom: ${name}
Email: ${email}
Téléphone: ${phone || "Non renseigné"}
Entreprise: ${company || "Non renseigné"}
Service intéressé: ${service || "Non spécifié"}
Date: ${new Date().toLocaleString('fr-FR')}

Message:
${message}
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
