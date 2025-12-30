require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
// Remplace ces infos si besoin pour tester
const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
  sender: { email: process.env.BREVO_FROM, name: "Soutravision Test" },
  to: [{ email: process.env.BREVO_FROM }], // ton email vérifié Brevo
  subject: "Test envoi Brevo",
  htmlContent: `<p>Ceci est un test d'envoi depuis Brevo.</p>`,
});

apiInstance
  .sendTransacEmail(sendSmtpEmail)
  .then((response) => {
    console.log("Email envoyé avec succès !");
    console.log(response);
  })
  .catch((error) => {
    console.error("Erreur Brevo :", error.response?.body || error);
  });
